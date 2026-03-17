/**
 * Board position presets for the Play page.
 *
 * Position encoding: array[26]
 *   index 0  = white bar
 *   index 25 = black bar
 *   index 1–24 = points (1 = white's ace point, 24 = black's ace point)
 *   Positive values = white checkers, Negative = black checkers
 *
 * Standard backgammon: 15 checkers each.
 */

const BOARD_PRESETS = {
  'Opening': {
    position: [
      0,                                       // 0: white bar
      -2, 0, 0, 0, 0, 5,                       // 1–6
      0, 3, 0, 0, 0, -5,                       // 7–12
      5, 0, 0, 0, -3, 0,                       // 13–18
      -5, 0, 0, 0, 0, 2,                       // 19–24
      0,                                        // 25: black bar
    ],
    whiteOff: 0,
    blackOff: 0,
    dice: [3, 1],
    whiteTimer: '20:00',
    blackTimer: '20:00',
    pipCount: { white: 167, black: 167 },
    turn: 'white',
    score: { white: 59, black: 59 },
    firstRollMessage: null,
  },

  'Mid-game': {
    position: [
      0,                                       // 0: white bar
      0, 0, 0, 2, 3, -3,                       // 1–6
      -2, -2, 2, 0, 0, 3,                      // 7–12
      -4, -1, 0, 0, 2, 0,                      // 13–18
      3, 0, -1, 0, -2, 0,                      // 19–24
      0,                                        // 25: black bar
    ],
    whiteOff: 0,
    blackOff: 0,
    dice: [6, 4],
    whiteTimer: '14:32',
    blackTimer: '16:08',
    pipCount: { white: 121, black: 138 },
    turn: 'white',
    score: { white: 59, black: 59 },
    firstRollMessage: null,
  },

  'Bearing Off': {
    position: [
      0,                                       // 0: white bar
      3, 3, 2, 2, 1, 0,                        // 1–6
      0, 0, 0, 0, 0, 0,                        // 7–12
      0, 0, 0, 0, 0, 0,                        // 13–18
      0, -1, -2, -2, -3, -3,                   // 19–24
      0,                                        // 25: black bar
    ],
    whiteOff: 4,
    blackOff: 4,
    dice: [5, 2],
    whiteTimer: '05:22',
    blackTimer: '04:18',
    pipCount: { white: 25, black: 25 },
    turn: 'white',
    score: { white: 59, black: 59 },
    firstRollMessage: null,
  },

  'Bar & Blot': {
    position: [
      2,                                       // 0: white bar (2 on bar)
      0, 0, -1, 0, -4, -3,                    // 1–6
      0, -2, 0, 1, 0, 4,                      // 7–12
      -3, 0, 0, 1, 3, 0,                      // 13–18
      4, 0, -1, 0, 0, 0,                      // 19–24
      1,                                        // 25: black bar (1 on bar)
    ],
    whiteOff: 0,
    blackOff: 0,
    dice: [6, 1],
    whiteTimer: '11:45',
    blackTimer: '09:30',
    pipCount: { white: 145, black: 132 },
    turn: 'white',
    score: { white: 59, black: 59 },
    firstRollMessage: null,
  },

  'Game Over': {
    position: [
      0,                                       // 0: white bar
      0, 0, 0, 0, 0, 0,                        // 1–6
      0, 0, 0, 0, 0, 0,                        // 7–12
      -3, 0, -2, 0, -1, 0,                     // 13–18
      0, -2, -1, -2, -1, -3,                   // 19–24
      0,                                        // 25: black bar
    ],
    whiteOff: 15,
    blackOff: 0,
    dice: null,
    whiteTimer: '08:12',
    blackTimer: '02:45',
    pipCount: { white: 0, black: 98 },
    turn: null,
    score: { white: 60, black: 59 },
    firstRollMessage: null,
    autoModal: 'Defeat',
  },

  'First Roll': {
    position: [
      0,                                       // 0: white bar
      -2, 0, 0, 0, 0, 5,                       // 1–6
      0, 3, 0, 0, 0, -5,                       // 7–12
      5, 0, 0, 0, -3, 0,                       // 13–18
      -5, 0, 0, 0, 0, 2,                       // 19–24
      0,                                        // 25: black bar
    ],
    whiteOff: 0,
    blackOff: 0,
    dice: [4, 2],
    whiteTimer: '20:00',
    blackTimer: '20:00',
    pipCount: { white: 167, black: 167 },
    turn: 'white',
    score: { white: 59, black: 59 },
    firstRollMessage: 'Player1 goes first!',
  },
};

export default BOARD_PRESETS;
