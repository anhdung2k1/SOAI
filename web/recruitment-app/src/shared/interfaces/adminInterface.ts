export type Status = 'Accepted' | 'Rejected' | 'Pending';

export interface CandidateCV {
    id: number;
    email: string;
    username: string;
    datetime: string;
    candidate_name: string;
    position: string;
    status: Status;
    matched_score: number;
    justification: string;
}
