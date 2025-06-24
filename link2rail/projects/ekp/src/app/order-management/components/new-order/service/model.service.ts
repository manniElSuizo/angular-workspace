import { Injectable } from "@angular/core";
import { AttachedDocument, Cancellation, ConsignorDeclaration, EmptyWagonInformation, ExceptionalConsignment, HandoverConditions, Seal, ShippingDeliveryConditions, SpecialAnnotations, TakeOverConditions, WagonInformation } from "../../../models/rail-order-api";

@Injectable({
  providedIn: 'root'
})
export class ModelService {
  public preventEmptyAttachedDocuments(input: AttachedDocument[]): AttachedDocument[] | null {
    if(!input) {
      return null;
    }
    
    return input.filter(ad => ad && (ad.code || ad.dateOfIssue || ad.description || ad.numberOfOriginals || ad.referenceNumber));
  }

  public preventEmptyWagonInformation(input: WagonInformation[]): WagonInformation[] | null {
    if(!input) {
      return null;
    }

    return input.filter(wagonInfo => 
      (wagonInfo.atvCode || wagonInfo.bookingNumber || wagonInfo.bookingTimestamp || wagonInfo.comment || wagonInfo.completedByWagonItem || wagonInfo.completionTimestamp || wagonInfo.dangerousGoodIndicator || 
        !this.shippingDeliveryConditionsIsNullOrEmpty(wagonInfo.deliveryConditions) || !this.wagonInformationIsNullOrEmpty(wagonInfo.emptyWagonInformation) || wagonInfo.emptyWeight || (wagonInfo.exceptionalConsignments && wagonInfo.exceptionalConsignments.length > 0) || (wagonInfo.externalReferences && wagonInfo.externalReferences.length > 0) || 
        wagonInfo.finalDestinationCountry || wagonInfo.fulfilmentIndicator || wagonInfo.goodWeight || (wagonInfo.goods && wagonInfo.goods.length > 0) || !this.handOverConditionsIsNullOrEmpty(wagonInfo.handOver) || wagonInfo.imProfile || wagonInfo.lengthOfWagon || wagonInfo.limitedQuantity || wagonInfo.loadLimit || 
        wagonInfo.loadingStatus || (wagonInfo.loadingTackles && wagonInfo.loadingTackles.length > 0) || wagonInfo.loadingTacklesWeight || wagonInfo.minimumLineCategory || wagonInfo.numberOfAxle || wagonInfo.originShippingCountry || wagonInfo.printEraseIndicator || wagonInfo.priority || (wagonInfo.seals && wagonInfo.seals.length > 0) || 
        !this.shippingDeliveryConditionsIsNullOrEmpty(wagonInfo.shippingConditions) || wagonInfo.specialTreatmentForEmptyWagon || (wagonInfo.specialWagonHandlings && wagonInfo.specialWagonHandlings.length > 0) || wagonInfo.status || wagonInfo.summarizedIndicator || !this.takeOverConditionsIsNullOrEmpty(wagonInfo.takeOver) || 
        wagonInfo.totalWeight != null || wagonInfo.transportPlanId != null || wagonInfo.typeOfWagon || wagonInfo.wagonIdentifier != null || wagonInfo.wagonNumber != null || wagonInfo.wagonPosition != null || wagonInfo.weighingIndicator)
    );
    // let result = null;
    // if (input) {
    //   if (input.length === 1) {
    //     if (input[0]) {
    //       if (input[0].atvCode !== null || input[0].bookingNumber !== null || input[0].bookingTimestamp !== null || input[0].comment !== null || input[0].completedByWagonItem !== null || input[0].completionTimestamp !== null || input[0].dangerousGoodIndicator !== null || 
    //           !this.shippingDeliveryConditionsIsNullOrEmpty(input[0].deliveryConditions) || !this.wagonInformationIsNullOrEmpty(input[0].emptyWagonInformation) || input[0].emptyWeight !== null || (input[0].exceptionalConsignments !== null && input[0].exceptionalConsignments.length > 0) || (input[0].externalReferences !== null && input[0].externalReferences.length > 0) || 
    //           input[0].finalDestinationCountry !== null || input[0].fulfilmentIndicator !== null || input[0].goodWeight !== null || (input[0].goods !== null && input[0].goods.length > 0) || !this.handOverConditionsIsNullOrEmpty(input[0].handOver) || input[0].imProfile !== null || input[0].lengthOfWagon !== null || input[0].limitedQuantity !== null || input[0].loadLimit !== null || 
    //           input[0].loadingStatus !== null || (input[0].loadingTackles !== null && input[0].loadingTackles.length > 0) || input[0].loadingTacklesWeight !== null || input[0].minimumLineCategory !== null || input[0].numberOfAxle !== null || input[0].originShippingCountry || input[0].printEraseIndicator || input[0].priority !== null || (input[0].seals !== null && input[0].seals.length > 0) || 
    //           !this.shippingDeliveryConditionsIsNullOrEmpty(input[0].shippingConditions) || input[0].specialTreatmentForEmptyWagon !== null || (input[0].specialWagonHandlings !== null && input[0].specialWagonHandlings.length > 0) || input[0].status !== null || input[0].summarizedIndicator !== null || !this.takeOverConditionsIsNullOrEmpty(input[0].takeOver) || 
    //           input[0].totalWeight != null || input[0].transportPlanId != null || input[0].typeOfWagon !== null || input[0].wagonIdentifier != null || input[0].wagonNumber != null || input[0].wagonPosition != null || input[0].weighingIndicator !== null) {
    //             result = input;
    //       }        
    //     }
    //   } else if (input.length > 1) {
    //     result = input;
    //   }
    // }
    // return result;
  }
  
  public preventEmptyLoadingTackles(wagonInformation: WagonInformation[]): WagonInformation[] {
    if (wagonInformation) {

      wagonInformation.forEach(wi => {
        if (wi && wi.loadingTackles) {
          wi.loadingTackles = wi.loadingTackles.filter(lt => lt && (lt.type || lt.identifier || lt.number || lt.weight));
        }
      });

      // for (let item of wagonInformation) {
      //   if (item && item.loadingTackles && item.loadingTackles.length === 1) {
      //     const loadingTackle = item.loadingTackles[0];
      //     if (loadingTackle) {
      //       if (!loadingTackle.type && !loadingTackle.identifier && !loadingTackle.number && loadingTackle.weight === 0) {
      //         item.loadingTackles = [];
      //       }
      //     }
      //   }
      // }
    }
    return wagonInformation;    
  }

  public preventEmptyPackingUnit(wagonInformation: WagonInformation[]): WagonInformation[] {
    if (!wagonInformation) {
      return wagonInformation;
    }
    
    wagonInformation.forEach(wi => {
      if (wi && wi.goods) {
        wi.goods.forEach(good => {
          if(good && good.packingUnits) {
            good.packingUnits = good.packingUnits.filter(pu => pu.number || pu.type || pu.description);
          }
        });
      }
    });
    
    return wagonInformation;
  }

  public preventEmptySeals(seals: Seal[]): Seal[] {
    if(!seals) {
      return seals;
    }

    return seals.filter(s => s?.referenceNumber && s?.type);
  }

  public preventEmptyExceptionalConsignments(wagonInformation: WagonInformation[]): WagonInformation[] {
    if(!wagonInformation) {
      return wagonInformation;
    }

    wagonInformation.forEach(wi => {
      if(wi) {
        wi.exceptionalConsignments = wi.exceptionalConsignments.filter(ec => ec?.imCode && ec?.permissionNumber);
      }
    });
    return wagonInformation;
  }

  public preventEmptySpecialAnnotations(input: SpecialAnnotations): SpecialAnnotations | null {
    if (!input) {
      return input;
    }
    
    if (input.consignorDeclarations) {

      let tempList: ConsignorDeclaration[] = [];
      for (let item of input.consignorDeclarations) {
        if (item['code'] || item['additionalInformation'] || item['description'] ) {
          tempList.push(item);
        }
      }
      input.consignorDeclarations = tempList;
    }
    return input;
  }

  private consignorDeclarationsIsNullOrEmpty(input: ConsignorDeclaration[]): boolean {
    let result = false;
    if (input && input.length === 1) {
      if (input[0].additionalInformation == null || input[0].code == null || input[0].description == null) {
        result = true;
      }
    }
    return result;
  }

  private takeOverConditionsIsNullOrEmpty(takeOver: TakeOverConditions): boolean {
    let result = true;
    if (takeOver) {
      if (takeOver.arrival !== null || takeOver.loadingAuthorisation !== null || takeOver.originPort !== null || takeOver.shipName !== null || takeOver.shipOwner !== null || takeOver.typeOfTakeover !== 1) {
        result = false;
      }
    }
    return result;
  }

  private handOverConditionsIsNullOrEmpty(handOver: HandoverConditions): boolean {
    let result = true;
    if (handOver) {
      if (handOver.departure !== null || handOver.destinationPort !== null || handOver.shipName !== null || handOver.shipOwner !== null || handOver.typeOfHandover !== 0) {
        result = false;
      }
    }
    return result;
  }

  private wagonInformationIsNullOrEmpty(emptyWagonInformation: EmptyWagonInformation): boolean {
    let result = true;
    if (emptyWagonInformation) {
      if (emptyWagonInformation.cluster !== null || emptyWagonInformation.description !== null || emptyWagonInformation.modelId !== null || emptyWagonInformation.type !== null) {
        result = false;
      }
    }
    return result;
  }

  private shippingDeliveryConditionsIsNullOrEmpty(shippingDeliveryConditions: ShippingDeliveryConditions): boolean {
    let result = true;
    if (shippingDeliveryConditions) {
      if (shippingDeliveryConditions.actual !== null || shippingDeliveryConditions.deviationCauser !== null || shippingDeliveryConditions.deviationReasonCode !== null || shippingDeliveryConditions.deviationReasonDescription !== null || shippingDeliveryConditions.scheduled !== null) {
        result = false;
      }
    }
    return result;
  }

  private cancellationIsNullOrEmpty(cancellation: Cancellation): boolean {
    let result = true;
    if (cancellation) {
      if (cancellation.accountableToCustomer !== null || cancellation.cause !== null || cancellation.clientAgent !== null || cancellation.communicationChannel !== null || cancellation.timestamp !== null) {
        result = false;
      }
    }
    return result;
  }
}