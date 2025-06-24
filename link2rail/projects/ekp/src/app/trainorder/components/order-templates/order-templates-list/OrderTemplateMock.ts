import { OrderTemplateSummary, OrderTemplateSummaryResponse } from "@src/app/trainorder/models/OrderTemplateModels";
import { limitOrderTemplatesList } from "@src/app/shared/constants/Constants";
import {Tools} from "../../../mockup/tools";

export class OrderTemplateMock {
    static getOrderTemplateListResponse(): OrderTemplateSummaryResponse {
        const num = 25; //this.randomNumber(5, 10);
        const list = this.getList(num);
        const response: OrderTemplateSummaryResponse = {
            items: list,
            limit: limitOrderTemplatesList,
            offset: 0,
            total: list.length + 10
        }
        return response;
    }

    static getList(length: number = 3): OrderTemplateSummary[] {
        let orderTemplates = [];
        for (let i = 0; i < length; i++) {
            orderTemplates.push(this.getOrderTemplate(Tools.randomString(5)));
        }
        return orderTemplates;
    }

    static getOrderTemplate(prefix: string = 'MOCK'): OrderTemplateSummary {
        let num = Math.round(Math.random() * 100);
        return {
            templateId: "F-" + num,
            templateName: "F-" + num + "-template",
            trainType: num % 2 == 0 ? "Plantrain" : "Flextrain",
            sender: prefix + " Sender",
            sendingStation: prefix + " Sending Station",
            receiver: prefix + " Receiver",
            receivingStation: prefix + " Receiving Station",
            validFrom: new Date(2022, 1, 1),
            validTo: new Date(2030, 12, 31)
        }
    }

}
