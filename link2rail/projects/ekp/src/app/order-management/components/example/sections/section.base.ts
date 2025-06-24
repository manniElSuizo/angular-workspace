import { Component } from "@angular/core";

@Component({ template: '' })
export abstract class SectionBase {
  protected abstract validate(): string[];
}