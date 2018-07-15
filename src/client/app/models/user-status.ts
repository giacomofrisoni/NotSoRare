import { SessionStatus } from "./session-status.enum";

export class UserStatus {
    id: number;
    sessionStatus: SessionStatus;

    public UserStatus(id: number, sessionStatus: SessionStatus) {
        this.id = id;
        this.sessionStatus = sessionStatus;
    }
}
