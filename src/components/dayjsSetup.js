// src/dayjsSetup.js
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ar";
import "dayjs/locale/en";

dayjs.extend(relativeTime);

export function setDayjsLocale(lang) {
  dayjs.locale(lang);
}
