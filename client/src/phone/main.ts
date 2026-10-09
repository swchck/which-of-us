import { createApp } from 'vue';
import '../common/base.css';
import { installTapHaptics } from './haptics';
import PhoneApp from './PhoneApp.vue';
import { installSound } from './sound';

installTapHaptics();
installSound();
createApp(PhoneApp).mount('#app');
