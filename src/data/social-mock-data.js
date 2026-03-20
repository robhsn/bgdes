/* ═══════════════════════════════════════════════════════════════
   Social features — mock data for IDP design surfaces
   ═══════════════════════════════════════════════════════════════ */

export const MOCK_FRIENDS = [
  { id: 1,  username: 'GammonKing42',    avatar: 'Timothy',    rating: 1650, online: true  },
  { id: 2,  username: 'BackgammonQueen', avatar: 'Princess',   rating: 1580, online: true  },
  { id: 3,  username: 'DiceRoller99',   avatar: 'Wizard',     rating: 1420, online: false },
  { id: 4,  username: 'BoardMaster',    avatar: 'King',       rating: 1700, online: true  },
  { id: 5,  username: 'LuckyRoller',    avatar: 'Clown',      rating: 1350, online: false },
  { id: 6,  username: 'PointBuilder',   avatar: 'Knight',     rating: 1500, online: true  },
  { id: 7,  username: 'BearingOff',     avatar: 'Adventurer', rating: 1280, online: false },
  { id: 8,  username: 'DoubleUp',       avatar: 'Chef',       rating: 1620, online: false },
  { id: 9,  username: 'PipCounter',     avatar: 'Robot',      rating: 1480, online: true  },
  { id: 10, username: 'BlotHitter',     avatar: 'Soldier',    rating: 1390, online: false },
];

export const MOCK_REQUESTS_INCOMING = [
  { id: 11, username: 'NewChallenger',  avatar: 'Knight',  rating: 1300 },
  { id: 12, username: 'BoardMaster2',   avatar: 'King',    rating: 1700 },
  { id: 13, username: 'RollMaster',     avatar: 'Mummy',   rating: 1450 },
];

export const MOCK_REQUESTS_SENT = [
  { id: 20, username: 'CasualPlayer',   avatar: 'Chef',    rating: 1200 },
  { id: 21, username: 'ProGammer',      avatar: 'Drac',    rating: 1800 },
];

export const MOCK_SEARCH_RESULTS = {
  friends: [
    { id: 1,  username: 'GammonKing42',    avatar: 'Timothy',  rating: 1650, online: true, isFriend: true },
    { id: 4,  username: 'BoardMaster',     avatar: 'King',     rating: 1700, online: true, isFriend: true },
  ],
  players: [
    { id: 30, username: 'GammonPro',       avatar: 'Thief',    rating: 1550, online: true,  isFriend: false },
    { id: 31, username: 'GammonNewbie',    avatar: 'Ghosty',   rating: 1100, online: false, isFriend: false },
    { id: 32, username: 'GammonLover',     avatar: 'Witch',    rating: 1320, online: true,  isFriend: false },
    { id: 33, username: 'GammonChamp',     avatar: 'Lincoln',  rating: 1900, online: false, isFriend: false },
  ],
};

export const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'friend_request',     user: { username: 'NewChallenger', avatar: 'Knight' },  timestamp: '2m ago',  read: false },
  { id: 2, type: 'challenge_received', user: { username: 'BoardMaster',   avatar: 'King' },    timestamp: '5m ago',  read: false, format: '5-point', isFriend: true },
  { id: 7, type: 'message',            user: { username: 'GammonKing42',  avatar: 'Timothy' }, timestamp: '8m ago',  read: false },
  { id: 3, type: 'friend_accepted',    user: { username: 'GammonKing42',  avatar: 'Timothy' }, timestamp: '1h ago',  read: true },
  { id: 8, type: 'challenge_received', user: { username: 'GammonPro',     avatar: 'Thief' },   timestamp: '1h ago',  read: true, format: '3-point', isFriend: false },
  { id: 4, type: 'challenge_accepted', user: { username: 'DiceRoller99',  avatar: 'Wizard' },  timestamp: '2h ago',  read: true },
  { id: 5, type: 'challenge_declined', user: { username: 'LuckyRoller',   avatar: 'Clown' },   timestamp: '3h ago',  read: true },
  { id: 11, type: 'challenge_sent',    user: { username: 'MarinaD',       avatar: 'Princess' }, timestamp: '3h ago',  read: true },
  { id: 9, type: 'message',            user: { username: 'BackgammonQueen', avatar: 'Princess' }, timestamp: '3h ago', read: true },
  { id: 10, type: 'message',           user: { username: 'BoardMaster',   avatar: 'King' },    timestamp: '5h ago',  read: true },
  { id: 6, type: 'fb_friends_found',   user: { username: 'FBFriend1',     avatar: 'Gobby' },   timestamp: '1d ago',  read: true, count: 3 },
];

export const MOCK_FB_FRIENDS = [
  { id: 40, username: 'FBFriend1', avatar: 'Gobby',  rating: 1100, fbName: 'John Smith'  },
  { id: 41, username: 'FBFriend2', avatar: 'Clown',  rating: 1250, fbName: 'Jane Doe'    },
  { id: 42, username: 'FBFriend3', avatar: 'Farmer', rating: 980,  fbName: 'Bob Wilson'  },
];

export const MOCK_MESSAGES = [
  { id: 50, user: { username: 'GammonKing42', avatar: 'Timothy' }, timestamp: '10m ago' },
  { id: 51, user: { username: 'BackgammonQueen', avatar: 'Princess' }, timestamp: '1h ago' },
  { id: 52, user: { username: 'BoardMaster', avatar: 'King' }, timestamp: '3h ago' },
];

export const MOCK_CHALLENGES_INCOMING = [
  { id: 60, user: { username: 'BoardMaster', avatar: 'King' }, format: '5-point', timestamp: '3m ago', isFriend: true },
  { id: 61, user: { username: 'GammonPro', avatar: 'Thief' }, format: '3-point', timestamp: '15m ago', isFriend: false },
];
