import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private _isLoading = signal<boolean>(false);
  private _loadingText = signal<string>('Loading...');
  private loadingCount = 0;

  readonly isLoading = this._isLoading;
  readonly loadingText = this._loadingText;

  show(text: string = 'Loading...'): void {
    this.loadingCount++;
    this._loadingText.set(text);
    this._isLoading.set(true);
  }

  hide(): void {
    this.loadingCount--;
    if (this.loadingCount <= 0) {
      this.loadingCount = 0;
      this._isLoading.set(false);
    }
  }

  forceHide(): void {
    this.loadingCount = 0;
    this._isLoading.set(false);
  }
}
