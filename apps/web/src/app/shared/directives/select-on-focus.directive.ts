import { Directive, ElementRef, HostListener, inject } from '@angular/core';

@Directive({
  selector: 'input[appSelectOnFocus]',
  standalone: true,
})
export class SelectOnFocusDirective {
  private readonly elementRef = inject<ElementRef<HTMLInputElement>>(ElementRef);

  @HostListener('focus')
  selectValue(): void {
    this.elementRef.nativeElement.select();
  }
}
