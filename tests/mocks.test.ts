import { describe, it, expect } from 'vitest';
import { MockPropertiesService, MockSession, MockUtilities } from '../src';

describe('Mock Services', () => {
    it('MockPropertiesService should store and retrieve properties', () => {
        const service = new MockPropertiesService({ INIT: 'val' }).getScriptProperties();
        expect(service.getProperty('INIT')).toBe('val');
        service.setProperty('KEY', 'VALUE');
        expect(service.getProperty('KEY')).toBe('VALUE');
        service.deleteProperty('INIT');
        expect(service.getProperty('INIT')).toBeNull();
    });

    it('MockSession should return user email', () => {
        const session = new MockSession('user@example.com');
        expect(session.getActiveUser().getEmail()).toBe('user@example.com');
    });

    it('MockUtilities should format dates', () => {
        const utils = new MockUtilities();
        const date = new Date(2023, 0, 15, 12, 30, 45); // Jan 15, 2023 12:30:45
        const formatted = utils.formatDate(date, 'JST', 'yyyy/MM/dd HH:mm:ss');
        expect(formatted).toBe('2023/01/15 12:30:45');
    });
});
