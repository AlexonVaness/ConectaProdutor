import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})
export class AlertcontrollerService {

  constructor(private alertController: AlertController) { }

  async presentConfirm(message: string, header: string = 'Confirmar'): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertController.create({
        header: header,
        message: message,
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel',
            cssClass: 'secondary',
            handler: () => {
              resolve(false);
            }
          }, {
            text: 'Confirmar',
            handler: () => {
              resolve(true);
            }
          }
        ]
      });

      await alert.present();
    });
  }
}
