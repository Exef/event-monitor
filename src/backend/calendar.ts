import {Router} from 'express';
import {TwingEnvironment, TwingLoaderFilesystem} from 'twing';

import {Events} from './API/Events';

// eslint-disable-next-line new-cap
const router = Router();
const loader = new TwingLoaderFilesystem('src/backend/templates');
const twing = new TwingEnvironment(loader);

const polishDayNames = ['Niedziela', 'Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota'];
const eventGroups = ['hs3city', 'Elixir-Tricity'];

router.get('/cards', (req, res) => {
  const events = new Events();
  const fail = 500;
  let [cols, rows] = [null, null];

  if (req.query.cols) {
    cols = req.query.cols;
  }

  if (req.query.rows) {
    rows = req.query.rows;
  }

  events
    .getEventsFromGroups(eventGroups)
    .then(json => twing.render('cards.twig', {cols, rows, events: json}).then(output => {
      res.end(output);
    }))
    .catch(() => res.status(fail));
});


router.get('/calendar', (req, res) => {
  const startMonthNumber = req.query.month || (new Date().getMonth());
  // eslint-disable-next-line no-magic-numbers
  const periodInSeconds = 60 * 60 * 24 * 30 * 2; // two months
  const startDate = new Date();
  startDate.setMonth(startMonthNumber);
  startDate.setDate(1);
  startDate.setHours(0);
  startDate.setMinutes(0);
  startDate.setSeconds(0);

  const events = new Events(undefined, startDate, periodInSeconds);
  const fail = 500;
  events
    .getEventsFromGroups(eventGroups)
    .then(json => {
      const firstMonth: any[] = [];
      const secondMonth: any[] = [];
      json.forEach(event => {
        if (event.date.getMonth() === startMonthNumber) {
          firstMonth.push(event);
        } else {
          secondMonth.push(event);
        }
      });

      const templateVariables = {
        eventsFirst: firstMonth,
        eventsSecond: secondMonth,
        showFooter: !req.query.hideFooter,
        // eslint-disable-next-line no-magic-numbers
        fontSize: req.query.fontSize || 1.4,
        polishDayNames
      };

      twing.render('calendar.twig', templateVariables).then(output => {
        res.end(output);
      });
    })
    .catch(() => res.status(fail));
});

export default router;
