export interface UserStat {
    id: string;
    date: Date;
    accomplishedGoal: boolean;
    userId: string;
}

/**
 * user stats store historical data -- history of step goals and steps on a given date.
 * this can be used to display past step goals and steps taken or to calculate achievement conditions. 
 */