import { Component } from '@angular/core';
import { StampList } from '@app/constants';
import { StampService } from '@app/services/tools/stamp/stamp.service';
@Component({
    selector: 'app-stamp-config',
    templateUrl: './stamp-config.component.html',
    styleUrls: ['./stamp-config.component.scss'],
})
export class StampComponent {
    StampList: typeof StampList = StampList;

    constructor(public stampService: StampService) {}
}
