// cuenta.ts

import { Component, OnDestroy, OnInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  LucideUser,
  LucidePencil,
  LucideChevronRight,
  LucideLock,
  LucideLogOut,
  LucideArrowRight,
  LucideCamera
} from '@lucide/angular';
import { CuentaService } from './cuenta.service';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';

@Component({
  selector: 'app-cuenta',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LucideUser,
    LucidePencil,
    LucideChevronRight,
    LucideLock,
    LucideLogOut,
    LucideArrowRight,
    LucideCamera
  ],
  templateUrl: './cuenta.html',
  styleUrl: './cuenta.css'
})
export class Cuenta implements OnInit, OnDestroy {

  private cuentaService = inject(CuentaService);
  private authService = inject(AuthService);
  private toastService = inject(ToastService);

  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('cropCanvas') cropCanvas?: ElementRef<HTMLCanvasElement>;

  readonly userName  = this.cuentaService.userName;
  readonly userEmail = this.cuentaService.userEmail;
  readonly userImage = this.cuentaService.userImage;

  editingField = signal<string | null>(null);
  editValue = '';
  isSaving = signal(false);
  isUploadingImage = signal(false);
  showCropper = signal(false);
  cropZoom = signal(1);
  cropImageName = signal('perfil');

  private cropImage: HTMLImageElement | null = null;
  private cropImageObjectUrl = '';
  private cropOffsetX = 0;
  private cropOffsetY = 0;
  private isDraggingCrop = false;
  private dragStartX = 0;
  private dragStartY = 0;
  private dragBaseOffsetX = 0;
  private dragBaseOffsetY = 0;

  ngOnInit(): void {
    this.cuentaService.loadPerfil();
  }

  ngOnDestroy(): void {
    this.revokeCropObjectUrl();
  }

  onEditAvatar(): void {
    if (this.isSaving() || this.isUploadingImage()) return;
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    input.value = '';

    if (!file.type.startsWith('image/')) {
      this.toastService.warning('Selecciona un archivo de imagen.');
      return;
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      this.toastService.warning('Solo se permiten imágenes JPG o PNG.');
      return;
    }

    this.openCropper(file);
  }

  private openCropper(file: File): void {
    this.revokeCropObjectUrl();

    const cleanName = file.name.replace(/\.[^.]+$/, '').trim();
    this.cropImageName.set(cleanName || 'perfil');
    this.cropZoom.set(1);
    this.cropOffsetX = 0;
    this.cropOffsetY = 0;
    this.showCropper.set(true);

    this.cropImageObjectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => setTimeout(() => this.drawCropCanvas());
    image.src = this.cropImageObjectUrl;
    this.cropImage = image;
  }

  setCropZoom(value: string | number): void {
    const numericValue = Number(value);
    this.cropZoom.set(Number.isFinite(numericValue) ? numericValue : 1);
    this.drawCropCanvas();
  }

  startCropDrag(event: PointerEvent): void {
    event.preventDefault();
    this.isDraggingCrop = true;
    this.dragStartX = event.clientX;
    this.dragStartY = event.clientY;
    this.dragBaseOffsetX = this.cropOffsetX;
    this.dragBaseOffsetY = this.cropOffsetY;
    (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  }

  moveCropDrag(event: PointerEvent): void {
    if (!this.isDraggingCrop) return;

    this.cropOffsetX = this.dragBaseOffsetX + event.clientX - this.dragStartX;
    this.cropOffsetY = this.dragBaseOffsetY + event.clientY - this.dragStartY;
    this.drawCropCanvas();
  }

  endCropDrag(event: PointerEvent): void {
    if (!this.isDraggingCrop) return;
    this.isDraggingCrop = false;
    (event.currentTarget as HTMLElement).releasePointerCapture(event.pointerId);
  }

  cancelImageCrop(): void {
    if (this.isUploadingImage()) return;
    this.closeCropper();
  }

  confirmImageCrop(): void {
    const canvas = this.cropCanvas?.nativeElement;
    if (!canvas || this.isUploadingImage()) return;

    this.isUploadingImage.set(true);
    this.toastService.loading('Subiendo imagen...');

    canvas.toBlob(blob => {
      if (!blob) {
        this.toastService.error('No se pudo preparar la imagen.');
        this.isUploadingImage.set(false);
        return;
      }

      const imageFile = new File([blob], `${this.cropImageName()}-perfil.jpg`, { type: 'image/jpeg' });
      this.cuentaService.uploadProfileImage(imageFile).subscribe({
        next: () => {
          this.toastService.success('Imagen actualizada correctamente');
          this.closeCropper();
          this.isUploadingImage.set(false);
        },
        error: (err) => {
          console.error('Error al subir imagen', err);
          this.toastService.error('Error al subir la imagen');
          this.isUploadingImage.set(false);
        }
      });
    }, 'image/jpeg', 0.9);
  }

  private drawCropCanvas(): void {
    const canvas = this.cropCanvas?.nativeElement;
    const image = this.cropImage;
    if (!canvas || !image || !image.complete || !image.naturalWidth) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const width = canvas.width;
    const height = canvas.height;
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * this.cropZoom();
    const drawWidth = image.naturalWidth * scale;
    const drawHeight = image.naturalHeight * scale;

    const maxOffsetX = Math.max(0, (drawWidth - width) / 2);
    const maxOffsetY = Math.max(0, (drawHeight - height) / 2);
    this.cropOffsetX = Math.max(-maxOffsetX, Math.min(maxOffsetX, this.cropOffsetX));
    this.cropOffsetY = Math.max(-maxOffsetY, Math.min(maxOffsetY, this.cropOffsetY));

    const x = (width - drawWidth) / 2 + this.cropOffsetX;
    const y = (height - drawHeight) / 2 + this.cropOffsetY;

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#f8fafc';
    context.fillRect(0, 0, width, height);
    context.drawImage(image, x, y, drawWidth, drawHeight);
  }

  private closeCropper(): void {
    this.showCropper.set(false);
    this.isDraggingCrop = false;
    this.revokeCropObjectUrl();
  }

  private revokeCropObjectUrl(): void {
    if (this.cropImageObjectUrl) {
      URL.revokeObjectURL(this.cropImageObjectUrl);
      this.cropImageObjectUrl = '';
    }
  }

  onImageError(): void {
    this.cuentaService.userImage.set('');
  }

  startEdit(field: string, currentValue: string): void {
    this.editingField.set(field);
    this.editValue = currentValue;
    setTimeout(() => {
      document.querySelector<HTMLInputElement>('.info-input')?.focus();
    }, 50);
  }

  saveField(field: string): void {
    if (this.isSaving()) return;

    const trimmedValue = this.editValue.trim();

    // Validaciones de campos vacíos
    if (field !== 'password' && !trimmedValue) {
      this.toastService.warning(`El campo ${field} no puede estar vacío`);
      return;
    }

    // Validaciones específicas
    if (field === 'correo') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(trimmedValue)) {
        this.toastService.warning('Ingresa un correo válido');
        return;
      }
    }

    if (field === 'password') {
      if (!trimmedValue) {
        this.toastService.warning('La contraseña no puede estar vacía');
        return;
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

      if (!passwordRegex.test(trimmedValue)) {
        this.toastService.warning(
          'La contraseña debe tener: mínimo 8 caracteres, una mayúscula, una minúscula, un número y un símbolo (@$!%*?&)'
        );
        return;
      }
    }

    this.isSaving.set(true);
    this.toastService.loading('Guardando cambios...');

    let updateObservable$;

    switch (field) {
      case 'nombre':
        updateObservable$ = this.cuentaService.updateNombre(trimmedValue);
        break;
      case 'correo':
        updateObservable$ = this.cuentaService.updateEmail(trimmedValue);
        break;
      case 'password':
        updateObservable$ = this.cuentaService.updatePassword(this.editValue);
        break;
    }

    if (updateObservable$) {
      updateObservable$.subscribe({
        next: () => {
          this.toastService.success('Cambios guardados correctamente');
          this.editingField.set(null);
          this.editValue = '';
          this.isSaving.set(false);
        },
        error: (err) => {
          console.error('Error saving field', err);
          this.toastService.error('Error al guardar los cambios');
          this.isSaving.set(false);
        }
      });
    } else {
      this.isSaving.set(false);
      this.toastService.hide();
    }
  }

  cancelEdit(): void {
    if (this.isSaving()) return;
    this.editingField.set(null);
    this.editValue = '';
  }

  onLogout(): void {
    this.authService.confirmLogout();
  }
}
