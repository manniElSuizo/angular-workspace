import { Component, EventEmitter, Inject, LOCALE_ID, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Observable, Subject, Subscription } from 'rxjs';
import { InfrastructureLocation, InfrastructureLocationResponse, StationType } from '@src/app/trainorder/models/location.models';
import { StationTypes } from '@src/app/shared/enums/stations.enum';
import { DatePipe } from '@angular/common';
import { DayObj } from '../week-view.component';
import { AppService } from '@src/app/app.service';
import { CustomerProfile } from '@src/app/trainorder/models/authorization';
import { ApiTrainsListRequest, ApiTrainsListResponse, TrainSummary } from '@src/app/trainorder/models/ApiTrainsList.models';
import { ApiHolidayResponse, Holiday } from '@src/app/trainorder/models/Holiday.model';
import { ProductType } from '@src/app/shared/enums/train-types.enum';
import { debounceTime } from 'rxjs/operators';
import moment from 'moment';
import { TrainorderService } from '@src/app/trainorder/services/trainorder.service';
import { LocalStorageService } from '@src/app/shared/services/local-storage/local-storage.service';

const WEEK_VIEW_FILTER_SENDING_STATION_NAME = 'week-view-filter-sending-station-name';
const WEEK_VIEW_FILTER_SENDING_STATION_KEY_ALPHA = 'week-view-filter-sending-station-key-alpha';
const WEEK_VIEW_FILTER_SENDING_STATION_KEY_SEQUENCE = 'week-view-filter-sending-station-key-sequence';
const WEEK_VIEW_FILTER_RECEIVING_STATION_NAME = 'week-view-filter-receiving-station-name';
const WEEK_VIEW_FILTER_RECEIVING_STATION_KEY_ALPHA = 'week-view-filter-receiving-station-key-alpha';
const WEEK_VIEW_FILTER_RECEIVING_STATION_KEY_SEQUENCE = 'week-view-filter-receiving-station-key-sequence'
const WEEK_VIEW_FILTER_TRAIN_NUMBER = 'week-view-filter-trainnumber';
const TRAIN_NUMBER = 'trainNumber';
const WEEK_VIEW_FILTER_CURRENT_DATE = 'week-view-filter-current-date';
const SENDING_STATION = 'sendingStation';
const SENDING_STATION_KEY_ALPHA = 'sendingStationKeyAlpha';
const SENDING_STATION_KEY_SEQUENCE = 'sendingStationKeySequence';
const RECEIVING_STATION = 'receivingStation';
const RECEIVING_STATION_KEY_ALPHA = 'receivingStationKeyAlpha';
const RECEIVING_STATION_KEY_SEQUENCE = 'receivingStationKeySequence';
const FOCUSED = 'focused';

@Component({
  selector: 'app-week-view-filter',
  templateUrl: './week-view-filter.component.html',
  styleUrls: ['./week-view-filter.component.scss']
})
export class WeekViewFilterComponent implements OnInit, OnDestroy {

  @Output() dow = new EventEmitter<any>();

  public showLoadMoreButton$: Subject<boolean> = new Subject();
  public loadingInProgress$: Subject<boolean> = new Subject();
  public trainsList: TrainSummary[] = [];
  public totalTrains: number;
  public regularTrains: any = {};
  public specialTrains: any = {};
  public offset: number = 0;
  public limit: number = 125;

  protected trainnumbers: string[] = [];
  protected numberOfTrains: number;
  protected sendingStationsAutocomplete: InfrastructureLocation[] = []; // Array of values for autocomplete, retrieved from the server
  protected receivingStationsAutocomplete: InfrastructureLocation[] = [];
  protected activeFiltersCount$: Observable<number>;
  protected filterForm: FormGroup;

  private subscription: Subscription = new Subscription();
  private datepipe: DatePipe;
  private receivingStationInputChange: Subject<string> = new Subject<string>(); // in order to have a delay between the requests
  private sendingStationInputChange: Subject<string> = new Subject<string>(); // Used to track the input in the field
  private customerProfile: CustomerProfile | null | undefined = null;
  private day = 24 * 60 * 60 * 1000;
  private now = new Date();
  private trainNumberFilterActive: boolean;
  private sendingStationFilterActive: boolean;
  private receivingStationFilterActive: boolean;
  private holidays: Holiday[] = [];

  private trainsListServiceSubscription: Subscription;

  public daysOfWeek: {
    monday: DayObj;
    tuesday: DayObj;
    wednesday: DayObj;
    thursday: DayObj;
    friday: DayObj;
    saturday: DayObj;
    sunday: DayObj;
  };

  constructor(@Inject(LOCALE_ID) private locale: string, private appService: AppService, private trainOrderService: TrainorderService, private storage: LocalStorageService) {
    this.datepipe = new DatePipe(this.locale);
    this.createFilterForm();
    this.fetchFilterValuesFromSessionStorage();
    this.registerForInputChanges();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.trainsListServiceSubscription.unsubscribe();
  }

  ngOnInit(): void {
    this.fetchTrains(this.updateFilter());
    this.fetchHolidays();
  }

  private registerForInputChanges(): void {
    this.registerForTrainNumberInputChanges();
    this.registerForCustomerSelectionChanges();
    this.registerForStationInputChanges();
  }

  private registerForStationInputChanges(): void {
    this.registerForSendingStationInputChanges();
    this.registerForReceivingStationInputChanges();
  }

  private registerForTrainNumberInputChanges(): void {
    this.subscription.add(
      this.trainNumber.valueChanges.subscribe(input => {
          sessionStorage.setItem(WEEK_VIEW_FILTER_TRAIN_NUMBER, input);
          this.trainNumberFilterActive = input.length > 0;
          this.resetList();
          const filter = this.updateFilter();
          filter.trainNumber = this.trainNumber.value;
          this.resetList();
          this.fetchTrains(filter);
      })
    );
}

  private registerForSendingStationInputChanges(): void {
      this.subscription.add(
          this.sendingStationInputChange.pipe(debounceTime(500)).subscribe((input) => {
            this.resetList();
            if (input?.length === 0) {
              this.sendingStationsAutocomplete = [];
              this.sendingStationFilterActive = false;
              sessionStorage.removeItem(WEEK_VIEW_FILTER_SENDING_STATION_NAME);
              sessionStorage.removeItem(WEEK_VIEW_FILTER_SENDING_STATION_KEY_ALPHA);
              sessionStorage.removeItem(WEEK_VIEW_FILTER_SENDING_STATION_KEY_SEQUENCE);
              this.sendingStationKeyAlpha.setValue('');
              this.sendingStationKeySequence.setValue('');
              this.sendingStationsAutocomplete = [];
              this.fetchTrains(this.updateFilter());
            } else {
              const item = this.sendingStationsAutocomplete.find(station => { return station.name === input; } );
              if (item) {
                  this.sendingStationFilterActive = true;
                  sessionStorage.setItem(WEEK_VIEW_FILTER_SENDING_STATION_NAME, item.name);
                  sessionStorage.setItem(WEEK_VIEW_FILTER_SENDING_STATION_KEY_ALPHA, item.objectKeyAlpha);
                  sessionStorage.setItem(WEEK_VIEW_FILTER_SENDING_STATION_KEY_SEQUENCE, String(item.objectKeySequence));
                  this.sendingStationKeyAlpha.setValue(item.objectKeyAlpha);
                  this.sendingStationKeySequence.setValue(item.objectKeySequence);
                  this.sendingStationsAutocomplete = [];
                  this.fetchTrains(this.updateFilter());
              } else {
                  this.getAutocompleteSuggestions(input, StationTypes.SENDING);
              }
            }
          })
      );
  }

  private registerForReceivingStationInputChanges(): void {
      this.subscription.add(
          this.receivingStationInputChange.pipe(debounceTime(500)).subscribe((input) => {
            this.resetList();
            if (input?.length === 0) {
              this.receivingStationsAutocomplete = [];
              this.receivingStationFilterActive = false;
              sessionStorage.removeItem(WEEK_VIEW_FILTER_RECEIVING_STATION_NAME);
              sessionStorage.removeItem(WEEK_VIEW_FILTER_RECEIVING_STATION_KEY_ALPHA);
              sessionStorage.removeItem(WEEK_VIEW_FILTER_RECEIVING_STATION_KEY_SEQUENCE);
              this.receivingStationKeyAlpha.setValue('');
              this.receivingStationKeySequence.setValue('');
              this.receivingStationsAutocomplete = [];
              this.fetchTrains(this.updateFilter());
            } else {
              const item = this.receivingStationsAutocomplete.find(station => { return station.name === input; } );
              if (item) {
                this.receivingStationFilterActive = true;
                sessionStorage.setItem(WEEK_VIEW_FILTER_RECEIVING_STATION_NAME, item.name);
                sessionStorage.setItem(WEEK_VIEW_FILTER_RECEIVING_STATION_KEY_ALPHA, item.objectKeyAlpha);
                sessionStorage.setItem(WEEK_VIEW_FILTER_RECEIVING_STATION_KEY_SEQUENCE, String(item.objectKeySequence));
                this.receivingStationKeyAlpha.setValue(item.objectKeyAlpha);
                this.receivingStationKeySequence.setValue(item.objectKeySequence);
                this.receivingStationsAutocomplete = [];
                this.fetchTrains(this.updateFilter());
              } else {
                  this.getAutocompleteSuggestions(input, StationTypes.RECEIVING);
              }
            }
          })
      );
  }

  public setDaysOfWeek(event: any): void {
    this.daysOfWeek = event;
  }

  private fetchHolidays(): void {
    const lastDayOfFollowingWeek: Date = moment(this.daysOfWeek.sunday.date).add(1, 'week').toDate();
    this.trainOrderService.getHolidays(this.datepipe.transform(this.daysOfWeek.monday.date, 'yyyy-MM-dd'), this.datepipe.transform(lastDayOfFollowingWeek, 'yyyy-MM-dd')).subscribe({
      next: ((holiday: ApiHolidayResponse) => {
        this.holidays = holiday;
      }),
      error: (error => {
        console.error('Failed to load data: ', error);
      })
    });
  }

  protected activeFilterAmount(): number {
    let activeFilterAmount = 0;
    if (this.trainNumberFilterActive) {
      activeFilterAmount++;
    }
    if (this.sendingStationFilterActive) {
      activeFilterAmount++;
    }
    if (this.receivingStationFilterActive) {
      activeFilterAmount++;
    }
    return activeFilterAmount;
 }

  private fetchTrains(filter: ApiTrainsListRequest): void {
    if(this.trainsListServiceSubscription) {
      this.trainsListServiceSubscription.unsubscribe();
    }
    this.loadingInProgress$.next(true);
    console.log(filter);
    this.trainsListServiceSubscription = this.trainOrderService.sendTrainsListRequest(filter).subscribe({
      next: ((result: ApiTrainsListResponse) => {
        console.log(result);
        this.trainsList = this.trainsList.concat(result.items);
        this.totalTrains = result.total;
        this.offset = result.offset;
        this.limit = result.limit;
        this.numberOfTrains = this.trainsList?.length;
        this.setLoadMoreButtonState();
        this.regularTrains = [];
        this.specialTrains = [];
        this.trainsList.forEach((trainSummary: TrainSummary) => {
            const firstTrainItem = trainSummary.trains[0];
            if (trainSummary.productType === ProductType.REGULAR_TRAIN) {
                if (!this.regularTrains[firstTrainItem.trainNumber]) {
                    this.regularTrains[firstTrainItem.trainNumber] = {};
                    this.regularTrains[firstTrainItem.trainNumber].trainNumber = firstTrainItem.trainNumber;
                    this.regularTrains[firstTrainItem.trainNumber].sendingStation = trainSummary.sendingStation.name;
                    this.regularTrains[firstTrainItem.trainNumber].receivingStation = trainSummary.receivingStation.name;
                }
                let dateIndex = new Date(trainSummary.plannedDeparture).getDay();
                dateIndex = dateIndex === 0 ? 6 : dateIndex - 1;
                this.regularTrains[firstTrainItem.trainNumber][dateIndex] = { ...trainSummary };
                this.regularTrains[firstTrainItem.trainNumber][dateIndex].holidays = this.holidays.filter((h) => {
                    return h.date == this.datepipe.transform(trainSummary.plannedDeparture, "yyyy-MM-dd") || h.date == this.datepipe.transform(trainSummary.plannedArrival, "yyyy-MM-dd")
                });
            } else if (trainSummary.productType === ProductType.SPECIAL_TRAIN) {
                if (!this.specialTrains[firstTrainItem.trainNumber]) {
                    this.specialTrains[firstTrainItem.trainNumber] = {};
                    this.specialTrains[firstTrainItem.trainNumber].trainNumber = firstTrainItem.trainNumber;
                    this.specialTrains[firstTrainItem.trainNumber].sendingStation = trainSummary.sendingStation.name;
                    this.specialTrains[firstTrainItem.trainNumber].receivingStation = trainSummary.receivingStation.name;
                }
                let dateIndex = new Date(trainSummary.plannedDeparture).getDay();
                dateIndex = dateIndex === 0 ? 6 : dateIndex - 1;
                this.specialTrains[firstTrainItem.trainNumber][dateIndex] = { ...trainSummary };
                this.specialTrains[firstTrainItem.trainNumber][dateIndex].holidays = this.holidays.filter((h) => {
                    return h.date == this.datepipe.transform(trainSummary.plannedDeparture, "yyyy-MM-dd") || h.date == this.datepipe.transform(trainSummary.plannedArrival, "yyyy-MM-dd")
                });
            }
        });
      }),
      error: (error => {
          console.error('Failed to load data: ', error);
      })
    });
    this.trainsListServiceSubscription.add(() => {
      this.loadingInProgress$.next(false);
    });
  }

  public updateTrainsList(): void {
    const filter = this.updateFilter();
    this.fetchTrains(filter);
  }

  private setLoadMoreButtonState(): void {
    if (this.trainsList && this.totalTrains > 0 && this.totalTrains > this.trainsList.length) {
        this.showLoadMoreButton$.next(true);
    } else {
        this.showLoadMoreButton$.next(false);
    }
  }

  private registerForCustomerSelectionChanges(): void {
    this.subscription.add(this.appService.customerSelection.subscribe({
        next: ( (customerProfile) => {
            if (customerProfile) {
                if (customerProfile.partnerId.length === 0 && (!customerProfile.sgvId || (customerProfile.sgvId && customerProfile.sgvId.length === 0))) {
                    this.customerProfile = null;
                } else {
                    this.customerProfile = customerProfile;
                }
                this.resetList();
                this.fetchTrains(this.updateFilter());
            }
        })
    }));
  }

  private updateFilter(): ApiTrainsListRequest {
    const profiles: CustomerProfile[] = [];
    if (this.customerProfile) {
        profiles.push(this.customerProfile);
    }
    const filter: ApiTrainsListRequest = {
      customerProfiles: profiles,
      offset: this.offset,
      limit: this.limit,
      trainNumber: this.trainNumber.value,
      trainChainId: undefined,
      allTrainChains: false,
      sendingStationObjectKeyAlpha: this.filterForm.value.sendingStationKeyAlpha,
      sendingStationObjectKeySequence: this.filterForm.value.sendingStationKeySequence,
      receivingStationObjectKeyAlpha: this.filterForm.value.receivingStationKeyAlpha,
      receivingStationObjectKeySequence: this.filterForm.value.receivingStationKeySequence,
      plannedDepartureFrom: this.appService.dateStringToUtcDateTimeString(this.datepipe.transform(this.daysOfWeek.monday.date, 'yyyy-MM-dd')),
      plannedDepartureTo: this.appService.dateStringToUtcDateTimeString(this.datepipe.transform(this.daysOfWeek.sunday.date, 'yyyy-MM-dd')),
      sort: '+trainNumber',
    }
    return filter;
  }

  private createFilterForm(): void {
    this.filterForm = new FormGroup({
        trainNumber: new FormControl(''),
        sendingStation: new FormControl(''),
        receivingStation: new FormControl(''),
        sendingStationKeyAlpha: new FormControl(''),
        receivingStationKeyAlpha: new FormControl(''),
        sendingStationKeySequence: new FormControl(''),
        receivingStationKeySequence: new FormControl(''),
      }
    );
  }

  private fetchTrainnumberFromSessionStorage(): void {
    const s_trainNumber = sessionStorage.getItem(WEEK_VIEW_FILTER_TRAIN_NUMBER);
    if (s_trainNumber) {
      this.trainNumberFilterActive = true;
      const trainNumberInput = this.filterForm.get(TRAIN_NUMBER);
      if (trainNumberInput) {
          trainNumberInput.setValue(s_trainNumber);
      } else {
          console.error('Failed to find input field: trainNumber');
      }
    }
  }

  private fetchCurrentDateFromSessionStorage(): void {
    const s_currentDate = sessionStorage.getItem(WEEK_VIEW_FILTER_CURRENT_DATE);
      if (s_currentDate) {
        const date = new Date(s_currentDate);
        this.setWeekDays(date);
      } else {
        this.setWeekDays();
      }
  }

  private fetchSendingStationFromSessionStorage(): void {
    // SendingStationKeyName
    const s_sendingStationName = sessionStorage.getItem(WEEK_VIEW_FILTER_SENDING_STATION_NAME);
    if (s_sendingStationName) {
      this.sendingStationFilterActive = true;
      const sendingStationNameInput = this.filterForm.get(SENDING_STATION);
      if (sendingStationNameInput) {
          sendingStationNameInput.setValue(s_sendingStationName);
      } else {
          console.error('Failed to find input field: sendingStationName');
      }
    }

    // SendingStationKeyAlpha
    const s_sendingStationKeyAlpha = sessionStorage.getItem(WEEK_VIEW_FILTER_SENDING_STATION_KEY_ALPHA);
    if (s_sendingStationKeyAlpha) {
      const sendingStationKeyAlphaInput = this.filterForm.get(SENDING_STATION_KEY_ALPHA);
      if (sendingStationKeyAlphaInput) {
          sendingStationKeyAlphaInput.setValue(s_sendingStationKeyAlpha);
      } else {
          console.error('Failed to find input field: sendingStationKeyAlpha');
      }
    }

    // SendingStationKeySequence
    const s_sendingStationKeySequence = sessionStorage.getItem(WEEK_VIEW_FILTER_SENDING_STATION_KEY_SEQUENCE);
    if (s_sendingStationKeySequence) {
      const sendingStationKeySequenceInput = this.filterForm.get(SENDING_STATION_KEY_SEQUENCE);
      if (sendingStationKeySequenceInput) {
          sendingStationKeySequenceInput.setValue(s_sendingStationKeySequence);
      } else {
          console.error('Failed to find input field: sendingStationKeySequence');
      }
    }
  }

  private fetchReceivingStationFromSessionStorage(): void {
    // ReceivingStationKeyName
    const s_receivingStationName = sessionStorage.getItem(WEEK_VIEW_FILTER_RECEIVING_STATION_NAME);
    if (s_receivingStationName) {
      this.receivingStationFilterActive = true;
      const receivingStationNameInput = this.filterForm.get(RECEIVING_STATION);
      if (receivingStationNameInput) {
        receivingStationNameInput.setValue(s_receivingStationName);
      } else {
          console.error('Failed to find input field: receivingStationName');
      }
    }

    // ReceivingStationKeyAlpha
    const s_receivingStationKeyAlpha = sessionStorage.getItem(WEEK_VIEW_FILTER_RECEIVING_STATION_KEY_ALPHA);
    if (s_receivingStationKeyAlpha) {
      const receivingStationKeyAlphaInput = this.filterForm.get(RECEIVING_STATION_KEY_ALPHA);
      if (receivingStationKeyAlphaInput) {
          receivingStationKeyAlphaInput.setValue(s_receivingStationKeyAlpha);
      } else {
          console.error('Failed to find input field: receivingStationKeyAlpha');
      }
    }

    // ReceivingStationKeySequence
    const s_receivingStationKeySequence = sessionStorage.getItem(WEEK_VIEW_FILTER_RECEIVING_STATION_KEY_SEQUENCE);
    if (s_receivingStationKeySequence) {
      const receivingStationKeySequenceInput = this.filterForm.get(RECEIVING_STATION_KEY_SEQUENCE);
      if (receivingStationKeySequenceInput) {
          receivingStationKeySequenceInput.setValue(s_receivingStationKeySequence);
      } else {
          console.error('Failed to find input field: receivingStationKeySequence');
      }
    }
  }

  private fetchFilterValuesFromSessionStorage(): void {
    this.fetchCustomerProfileFromSessionStorage();
    this.fetchCurrentDateFromSessionStorage();
    this.fetchTrainnumberFromSessionStorage();
    this.fetchSendingStationFromSessionStorage();
    this.fetchReceivingStationFromSessionStorage();
  }

  /**
   * Emits the next input value from the field
   * @param event
   * @param field type of the field
   */
  protected autocompleteInputChanged(event: any): void {
      switch (event.target.name) {
          case 'sending-station':
              this.sendingStationInputChange.next(event.target.value);
              break;
          case 'receiving-station':
              this.receivingStationInputChange.next(event.target.value);
              break;
          default:
              break;
      }
  }

  private fetchCustomerProfileFromSessionStorage(): void {
    const activeProfiles = this.storage.getActiveProfiles();
    if (activeProfiles && activeProfiles[0]) {
      this.customerProfile = activeProfiles[0];
    } else {
      this.customerProfile = null;
    }
  }

  /**
   * Emits the request to load stations autocomplete suggestions if input length is greater than 2
   * @param input event from the input
   */
  protected getAutocompleteSuggestions(input: any, stationType: string): void {
      let autocompeteArray: InfrastructureLocation[] = [];
      let apiStationType = StationType.DEPARTURE;
      if (stationType === StationTypes.SENDING) {
          autocompeteArray = this.sendingStationsAutocomplete;
      } else if (stationType === StationTypes.RECEIVING) {
          apiStationType = StationType.DESTINATION;
          autocompeteArray = this.receivingStationsAutocomplete;
      }
      this.trainOrderService.getTrainsInfrastructureLocations(input, apiStationType, autocompeteArray).subscribe((result: InfrastructureLocationResponse) => {
          if (stationType === StationTypes.SENDING) {
            this.sendingStationsAutocomplete =  this.trainOrderService.createUniqueKeysInfrastructureLocations(result);
          } else if (stationType === StationTypes.RECEIVING) {
            this.receivingStationsAutocomplete = this.trainOrderService.createUniqueKeysInfrastructureLocations(result);
          }
      });
  }

  /**
   * Resets all filter values to default
   */
  protected resetFilterConditions(): void {
      this.filterForm = new FormGroup({
        trainNumber: new FormControl(''),
        sendingStation: new FormControl(''),
        receivingStation: new FormControl(''),
        sendingStationKeyAlpha: new FormControl(''),
        receivingStationKeyAlpha: new FormControl(''),
        sendingStationKeySequence: new FormControl(''),
        receivingStationKeySequence: new FormControl(''),
      });
      this.setWeekDays(new Date());
      sessionStorage.removeItem(WEEK_VIEW_FILTER_SENDING_STATION_KEY_SEQUENCE);
      sessionStorage.removeItem(WEEK_VIEW_FILTER_SENDING_STATION_KEY_ALPHA);
      sessionStorage.removeItem(WEEK_VIEW_FILTER_SENDING_STATION_NAME);
      sessionStorage.removeItem(WEEK_VIEW_FILTER_RECEIVING_STATION_KEY_SEQUENCE);
      sessionStorage.removeItem(WEEK_VIEW_FILTER_RECEIVING_STATION_KEY_ALPHA);
      sessionStorage.removeItem(WEEK_VIEW_FILTER_RECEIVING_STATION_NAME);
      sessionStorage.removeItem(WEEK_VIEW_FILTER_TRAIN_NUMBER);

      this.trainNumberFilterActive = false;
      this.sendingStationFilterActive = false;
      this.receivingStationFilterActive = false;

      this.sendingStationsAutocomplete = [];
      this.receivingStationsAutocomplete = [];

      this.fetchTrains(this.updateFilter());
  }

  /**
   * Clears the search input field on icon click
   * @param element search input to be cleared
   * @param key of the api request object
   */
  protected clearSearchInput(key: string) {
      switch (key) {
          case SENDING_STATION:
              this.filterForm.controls[SENDING_STATION].setValue('');
              this.filterForm.controls[SENDING_STATION_KEY_SEQUENCE].setValue('');
              this.filterForm.controls[SENDING_STATION_KEY_ALPHA].setValue('');
              sessionStorage.removeItem(WEEK_VIEW_FILTER_SENDING_STATION_KEY_SEQUENCE);
              sessionStorage.removeItem(WEEK_VIEW_FILTER_SENDING_STATION_KEY_ALPHA);
              sessionStorage.removeItem(WEEK_VIEW_FILTER_SENDING_STATION_NAME);
              this.sendingStationFilterActive = false;
              this.sendingStationsAutocomplete = [];
              break;
          case RECEIVING_STATION:
              this.filterForm.controls[RECEIVING_STATION].setValue('');
              this.filterForm.controls[RECEIVING_STATION_KEY_SEQUENCE].setValue('');
              this.filterForm.controls[RECEIVING_STATION_KEY_ALPHA].setValue('');
              sessionStorage.removeItem(WEEK_VIEW_FILTER_RECEIVING_STATION_KEY_SEQUENCE);
              sessionStorage.removeItem(WEEK_VIEW_FILTER_RECEIVING_STATION_KEY_ALPHA);
              sessionStorage.removeItem(WEEK_VIEW_FILTER_RECEIVING_STATION_NAME);
              this.receivingStationFilterActive = false;
              this.receivingStationsAutocomplete = [];
              break;
          case TRAIN_NUMBER:
              this.filterForm.controls[TRAIN_NUMBER].setValue('');
              sessionStorage.removeItem(WEEK_VIEW_FILTER_TRAIN_NUMBER);
              this.trainNumberFilterActive = false;
              break;
      }
      this.resetList();
      this.fetchTrains(this.updateFilter());
  }

  /**
   * Used for input date fields to add focus class
   * @param event
   */
  protected onFocus(event: any) {
      event.target.classList.add(FOCUSED);
  }

  /**
   * Used for input date fields to remove focus class
   * @param event
   */
  protected onBlur(event: any) {
      if (!event.target.value) {
          event.target.classList.remove(FOCUSED);
      }
  }

  /**
   * Changes the train list preview to the next or previous week
   * @param forward true: to the next week, false: to the previous week
   * @param numOfWeeks
   */
  protected jumpWeek(forward: boolean = true, numOfWeeks: number = 1) {
      let addDays = 7 * this.day * numOfWeeks;
      if (!forward) {
          addDays = addDays * -1;
      }

      this.regularTrains = {};
      this.specialTrains = {};
      this.setWeekDays(new Date(this.daysOfWeek.monday.date.getTime() + addDays));
      this.fetchHolidays();
      this.resetList();
      this.fetchTrains(this.updateFilter());
      this.dow.emit(this.daysOfWeek);
  }

  public resetList(limit: number = 125): void {
    this.trainsList = [];
    this.regularTrains = [];
    this.specialTrains = [];
    this.offset = 0;
    this.limit = limit;
  }

  /**
   * Changes train list preview to the current week
   */
  protected jumpToCurrentWeek() {
      this.regularTrains = {};
      this.specialTrains = {};
      this.setWeekDays(this.now);
      this.fetchHolidays();
      this.resetList();
      this.fetchTrains(this.updateFilter());
      this.dow.emit(this.daysOfWeek);
  }

  private setWeekDays(currentDate: Date = this.now) {
    if (currentDate) {
        const datestring = this.datepipe.transform(currentDate, 'yyyy-MM-dd');
        if (datestring) {
            sessionStorage.setItem(WEEK_VIEW_FILTER_CURRENT_DATE, datestring);
        }
    }

    let currentDayOfWeek = currentDate.getDay();
    let monday = new Date(currentDate.getTime() - ((currentDayOfWeek === 0 ? 7 : currentDayOfWeek) - 1) * this.day);
    this.daysOfWeek = {
        monday: { date: monday, position: 0 },
        tuesday: { date: new Date(monday.getTime() + 1 * this.day), position: 1 },
        wednesday: { date: new Date(monday.getTime() + 2 * this.day), position: 2 },
        thursday: { date: new Date(monday.getTime() + 3 * this.day), position: 3 },
        friday: { date: new Date(monday.getTime() + 4 * this.day), position: 4 },
        saturday: { date: new Date(monday.getTime() + 5 * this.day), position: 5 },
        sunday: { date: new Date(monday.getTime() + 6 * this.day), position: 6 },
    };
  }

  get sendingStation() {
    return this.filterForm.get(SENDING_STATION) as FormControl;
  }

  get sendingStationKeyAlpha() {
      return this.filterForm.get(SENDING_STATION_KEY_ALPHA) as FormControl;
  }

  get sendingStationKeySequence() {
      return this.filterForm.get(SENDING_STATION_KEY_SEQUENCE) as FormControl;
  }

  get receivingStationKeyAlpha() {
      return this.filterForm.get(RECEIVING_STATION_KEY_ALPHA) as FormControl;
  }

  get receivingStationKeySequence() {
      return this.filterForm.get(RECEIVING_STATION_KEY_SEQUENCE) as FormControl;
  }

  get receivingStation() {
      return this.filterForm.get(RECEIVING_STATION) as FormControl;
  }

  get trainNumber() {
    return this.filterForm.get(TRAIN_NUMBER) as FormControl;
  }
}


