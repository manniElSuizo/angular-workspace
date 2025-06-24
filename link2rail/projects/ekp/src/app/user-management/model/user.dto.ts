import { Role } from "./role.model";
import { WagonKeeper } from "./wagon-keeper";

interface IUserDtoOptions {
    userId?: number,
    userName: string, 
    salutation: string,
    firstname: string,
    lastname: string,
    email: string,
    secondaryEmail?: string,
    phone: string
  }
  
  interface IInternalUserDtoOptions extends IUserDtoOptions {
    roleIds: number[];    
  }
  
  interface IExternalUserDtoOptions extends IUserDtoOptions {
    marketAreaCustomer: string;
    customerName: string;
    partnerId: string;
    profiles: ProfileToRoles[];
    primaryProfileId: number;
    wagonKeepers?: string[];
  }
  
  class UserDto {
    userId?: number;
    email: string;
    secondaryEmail?: string;
    firstname: string;
    lastname: string;
    phone: string;
    salutation: string;
    userName: string; 
    
    constructor(options: IUserDtoOptions) {
        this.userId = options.userId;
        this.email = options.email;
        this.secondaryEmail = options.secondaryEmail;
        this.firstname = options.firstname;
        this.lastname = options.lastname;
        this.phone = options.phone;
        this.salutation = options.salutation;
        this.userName = options.userName;
    }
  }
  
  export class InternalUserDto extends UserDto {
    roleIds: number[];
    roles?: Role[] | null | undefined;
  
    constructor(options: IInternalUserDtoOptions) {
      super(options);
      this.roleIds = options.roleIds;      
    }
  }

  export interface ProfileToRoles {
    customerProfileId: number,
    roleIds: number[]
  }
  
  export class ExternalUserDto extends UserDto {
    marketAreaCustomer: string;
    customerName: string;
    partnerId: string;
    profiles: ProfileToRoles[];
    primaryProfileId: number;
    wagonKeepers?: string[];
  
    constructor(options: IExternalUserDtoOptions) {
      super(options);
      this.marketAreaCustomer = options.marketAreaCustomer;
      this.customerName = options.customerName;
      this.partnerId = options.partnerId;
      this.profiles = options.profiles;
      this.primaryProfileId = options.primaryProfileId;
      this.wagonKeepers = options.wagonKeepers;
    }
  }

  export class MarketAreaCustomerNumber {
    marketAreaCustomerNumber: string;
    customerName: string;
  }