import type { App } from 'vue';
import SpastaAuth from './spastaAuth.vue';
import SpastaCalendar from './spastaCalendar.vue';
import SpastaCategoryDialog from './spastaCategoryDialog.vue';
import SpastaCategoryList from './spastaCategoryList.vue';
import SpastaExpenses from './spastaExpenses.vue';
import SpastaFitness from './spastaFitness.vue';
import SpastaGreetings from './spastaGreetings.vue';
import SpastaTaskBoard from './spastaTaskBoard.vue';
import SpastaTaskCard from './spastaTaskCard.vue';
import SpastaTaskDialog from './spastaTaskDialog.vue';
import SpastaTaskQuickView from './spastaTaskQuickView.vue';

export default {
  install: (app: App) => {
    app.component('SpastaAuth', SpastaAuth);
    app.component('SpastaCalendar', SpastaCalendar);
    app.component('SpastaCategoryDialog', SpastaCategoryDialog);
    app.component('SpastaCategoryList', SpastaCategoryList);
    app.component('SpastaExpenses', SpastaExpenses);
    app.component('SpastaFitness', SpastaFitness);
    app.component('SpastaGreetings', SpastaGreetings);
    app.component('SpastaTaskBoard', SpastaTaskBoard);
    app.component('SpastaTaskCard', SpastaTaskCard);
    app.component('SpastaTaskDialog', SpastaTaskDialog);
    app.component('SpastaTaskQuickView', SpastaTaskQuickView);
  }
};