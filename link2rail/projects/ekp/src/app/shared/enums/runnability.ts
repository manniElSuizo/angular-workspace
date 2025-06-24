export class Runnability {
    static readonly FULLY_OPERATIONAL = new Runnability(0, 'Shared.SuitableForRunnigType.Fully-operational');
    static readonly IMMEDIATE_REPAIR_NEEDED = new Runnability(1, 'Shared.SuitableForRunnigType.Immediate-repair-needed');
    static readonly IMMEDIATE_UNLOADING_NEEDED = new Runnability(2, 'Shared.SuitableForRunnigType.Immediate_unloading-needed');
    static readonly LIMITED_OPERATIONAL_MWS = new Runnability(3, 'Shared.SuitableForRunnigType.Limited-operational-mws');
    static readonly MUST_NOT_BE_MOVED = new Runnability(4, 'Shared.SuitableForRunnigType.Must-not-be-moved');
    static readonly LIMITED_OPERATIONAL = new Runnability(5, 'Shared.SuitableForRunnigType.Limited-operational');
    static readonly RESTRICTED_OPERATIONAL = new Runnability(5, 'Shared.SuitableForRunnigType.Restricted-operational');
    private constructor(public readonly code: number, public readonly name: string) {}
}

export const RUNNABILITIES: Runnability[] = [
    Runnability.FULLY_OPERATIONAL,
    Runnability.IMMEDIATE_REPAIR_NEEDED,
    Runnability.IMMEDIATE_UNLOADING_NEEDED,
    Runnability.LIMITED_OPERATIONAL_MWS,
    Runnability.MUST_NOT_BE_MOVED,
    Runnability.LIMITED_OPERATIONAL,
    Runnability.RESTRICTED_OPERATIONAL
];