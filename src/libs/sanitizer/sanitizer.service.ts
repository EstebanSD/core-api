import { Injectable } from '@nestjs/common';
import * as createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

@Injectable()
export class SanitizerService {
  private window: Window & typeof globalThis;
  private DOMPurify: createDOMPurify.DOMPurify;

  constructor() {
    const jsdom = new JSDOM('');
    this.window = jsdom.window as unknown as Window & typeof globalThis;
    this.DOMPurify = createDOMPurify(this.window);
  }

  sanitizeSvg(svg: string): string {
    return this.DOMPurify.sanitize(svg, { USE_PROFILES: { svg: true, svgFilters: true } });
  }
}
