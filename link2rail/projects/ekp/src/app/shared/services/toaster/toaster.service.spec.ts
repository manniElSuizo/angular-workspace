import { TestBed } from '@angular/core/testing';
import { ToasterService, ToasterConfig, TOASTER_ELEMENT_ID } from './toaster.service';

describe('ToasterService', () => {
    let toasterService: ToasterService;

    beforeEach(async () => {
        TestBed.configureTestingModule({});
        toasterService = TestBed.inject(ToasterService);
        const parser = new DOMParser();
        
        const doc = parser.parseFromString(`<div class="cmp-notification toaster" id="${TOASTER_ELEMENT_ID}" role="status" style="display: none; position: fixed; bottom: 20px; margin: 0; padding: 0;">
                                    <div class="cmp-notification" role="status" style="margin: 0; color: #fff;">
                                        <db-icon slot="prenotification" icon="info"/>
                                        <p></p>
                                    </div>
                                </div>`,
                                'text/html');
        const toastElement = doc.querySelector(`#${TOASTER_ELEMENT_ID}`);
        document.body.appendChild(toastElement);
    });

    afterEach(() => {
        const toastNode = document.querySelector(`#${TOASTER_ELEMENT_ID}`);
        if (toastNode) {
            document.body.removeChild(toastNode);
        }
        if(document?.querySelector(`#uniqueToasterDivId0`)) {
            document.body.removeChild(document.querySelector(`#uniqueToasterDivId0`));
        }
    });

    it('should be created', () => {
        expect(toasterService).toBeTruthy();
    });

    it('should create a toaster message with default configuration', () => {
        const message = 'Test message';
        toasterService.addMessage(message);

        const toastNode = document.querySelector(`#uniqueToasterDivId0`) as HTMLElement;
        expect(toastNode).toBeTruthy();
        expect(toastNode.querySelector('p').innerHTML).toBe(message);
    });

    it('should remove the toaster message after the specified duration', (done) => {
        const message = 'Temporary message';
        const config: ToasterConfig = { duration: 1000 };

        toasterService.addMessage(message, config);

        const toastNode = document.querySelector(`#uniqueToasterDivId0`);
        expect(toastNode).toBeTruthy();

        setTimeout(() => {
            expect(document.querySelector(`#uniqueToasterDivId0`)).toBeNull();
            done();
        }, config.duration + 1100); // Adding buffer time for removal
    });

    it('should handle null toasterConfig gracefully', () => {
        const message = 'Null config message';
        toasterService.addMessage(message, null);

        const toastNode = document.querySelector(`#uniqueToasterDivId0`);
        expect(toastNode).toBeTruthy();
        expect(toastNode.querySelector('p').innerHTML).toBe(message);
    });

    it('should center the toaster message horizontally', () => {
        const message = 'Centered message';
        toasterService.addMessage(message);

        const toastNode = document.querySelector(`#uniqueToasterDivId0`) as HTMLElement;
        const expectedLeft = Math.round(window.innerWidth / 2) - Math.round(toastNode.offsetWidth / 2) + 'px';
        expect(toastNode.style.left).toBe(expectedLeft);
    });
});