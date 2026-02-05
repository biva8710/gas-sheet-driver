export class MockPropertiesService {
  private properties: Record<string, string>;

  constructor(initialProperties: Record<string, string> = {}) {
    this.properties = { ...initialProperties };
  }

  getScriptProperties() {
    return {
      getProperty: (key: string) => this.properties[key] ?? null,
      getProperties: () => ({ ...this.properties }),
      setProperty: (key: string, value: string) => { this.properties[key] = value; },
      setProperties: (props: Record<string, string>) => { Object.assign(this.properties, props); },
      deleteAllProperties: () => { this.properties = {}; },
      deleteProperty: (key: string) => { delete this.properties[key]; }
    };
  }
}
