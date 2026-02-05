export class MockSession {
    constructor(private email: string = 'test@example.com') { }

    getActiveUser() {
        return {
            getEmail: () => this.email,
        };
    }

    getScriptTimeZone() {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }
}
