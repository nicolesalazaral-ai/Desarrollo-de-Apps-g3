import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
  IonAlert, IonBackButton, IonBadge, IonButton, IonButtons, IonCard, IonCardContent, IonCardHeader,
  IonCardSubtitle, IonCardTitle, IonCheckbox, IonChip, IonContent, IonFab, IonFabButton, IonHeader,
  IonInput, IonItem, IonLabel, IonList, IonModal, IonProgressBar, IonRange, IonSelect, IonSelectOption,
  IonSegment, IonSegmentButton, IonSpinner, IonTitle, IonToast, IonToggle, IonToolbar,
} from '@ionic/angular';
import { IONIC_COMPONENTS, IonicComponentDoc } from '../ui-components';

@Component({
  selector: 'app-ui-component-detail',
  templateUrl: './ui-component-detail.page.html',
  styleUrls: ['./ui-component-detail.page.scss'],
  imports: [
    FormsModule, IonHeader, IonToolbar, IonButtons, IonBackButton, IonTitle, IonContent,
    IonCard, IonCardHeader, IonCardTitle, IonCardSubtitle, IonCardContent, IonButton, IonCheckbox,
    IonChip, IonInput, IonItem, IonLabel, IonList, IonModal, IonAlert, IonToast, IonSpinner,
    IonProgressBar, IonRange, IonSelect, IonSelectOption, IonToggle, IonSegment, IonSegmentButton,
    IonFabButton, IonBadge,
  ],
})
export class UiComponentDetailPage {
  public component: IonicComponentDoc;
  public isModalOpen = false;
  public isAlertOpen = false;
  public isToastOpen = false;
  public rangeValue = 45;
  public selectedColor = 'Azul';
  public selectedSegment = 'Todos';

  constructor(route: ActivatedRoute) {
    const slug = route.snapshot.paramMap.get('slug');
    this.component = IONIC_COMPONENTS.find((item) => item.slug === slug) ?? IONIC_COMPONENTS[0];
  }

  public closeModal(): void {
    this.isModalOpen = false;
  }
}