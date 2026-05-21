export interface CampusLandmark {
  id: string;
  name: string;
  category: 'academic' | 'dining' | 'hostel' | 'sports' | 'amenity' | 'natural';
  description: string;
  svgShape: 'rect' | 'polygon' | 'ellipse' | 'path';
  coords: string; // Coordinate string for SVG parsing (e.g. x,y,w,h or polygon points)
  labelX: number;
  labelY: number;
}

export interface RoomLayout {
  id: string;
  name: string;
  type: 'classroom' | 'lab' | 'office' | 'hall' | 'corridor' | 'lobby';
  description: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

export const campusLandmarks: CampusLandmark[] = [
  {
    id: 'block-a',
    name: 'Block A',
    category: 'academic',
    description: 'School of Humanities and Social Sciences (SHSS) offices, lecture halls, and humanities labs.',
    svgShape: 'rect',
    coords: '240,160,60,45',
    labelX: 270,
    labelY: 187,
  },
  {
    id: 'block-b',
    name: 'Block B',
    category: 'academic',
    description: 'School of Management and Entrepreneurship (SME). Houses classrooms, incubation hub, and executive lounges.',
    svgShape: 'rect',
    coords: '320,135,60,45',
    labelX: 350,
    labelY: 162,
  },
  {
    id: 'block-c',
    name: 'Block C',
    category: 'academic',
    description: 'School of Engineering (SoE). Contains major computer science labs, smart classrooms, and faculty corridors.',
    svgShape: 'rect',
    coords: '400,125,60,45',
    labelX: 430,
    labelY: 152,
  },
  {
    id: 'block-d',
    name: 'Block D',
    category: 'academic',
    description: 'School of Natural Sciences (SNS). Chemistry, physics, and life science research laboratories.',
    svgShape: 'rect',
    coords: '480,135,60,45',
    labelX: 510,
    labelY: 162,
  },
  {
    id: 'block-e',
    name: 'Block E',
    category: 'academic',
    description: 'Undergraduate study hubs, tutorial classrooms, and mechanical engineering workshop bays.',
    svgShape: 'rect',
    coords: '560,160,60,45',
    labelX: 590,
    labelY: 187,
  },
  {
    id: 'research-block',
    name: 'Research Block',
    category: 'academic',
    description: 'Multidisciplinary research wings, cleanrooms, and high-performance computing centers.',
    svgShape: 'rect',
    coords: '510,220,60,40',
    labelX: 540,
    labelY: 245,
  },
  {
    id: 'library',
    name: 'Central Library',
    category: 'amenity',
    description: '5-story main university library. High-speed study zones, physical archives, and reading floors.',
    svgShape: 'rect',
    coords: '395,210,70,50',
    labelX: 430,
    labelY: 240,
  },
  {
    id: 'lake',
    name: 'Central Lake',
    category: 'natural',
    description: 'Iconic central water body. Scenic walkways, seating banks, and campus fauna ecosystem.',
    svgShape: 'ellipse',
    coords: '400,340,110,65',
    labelX: 400,
    labelY: 345,
  },
  {
    id: 'dh1',
    name: 'Dining Hall 1',
    category: 'dining',
    description: 'Main vegetarian dining hall serving North and South Indian menus.',
    svgShape: 'rect',
    coords: '180,260,55,40',
    labelX: 207,
    labelY: 285,
  },
  {
    id: 'dh2',
    name: 'Dining Hall 2',
    category: 'dining',
    description: 'Multi-cuisine dining complex and food court with fast-food outlets.',
    svgShape: 'rect',
    coords: '180,330,55,40',
    labelX: 207,
    labelY: 355,
  },
  {
    id: 'dh3',
    name: 'Dining Hall 3',
    category: 'dining',
    description: 'Modern dining facility serving the newer hostel blocks.',
    svgShape: 'rect',
    coords: '575,320,55,40',
    labelX: 602,
    labelY: 345,
  },
  {
    id: 'mh-hostels',
    name: 'Boys Hostels (MH)',
    category: 'hostel',
    description: 'Men\'s hostel clusters (MH1 - MH5), including single occupancy rooms and laundry portals.',
    svgShape: 'polygon',
    coords: '120,400 210,400 210,470 120,470',
    labelX: 165,
    labelY: 440,
  },
  {
    id: 'lh-hostels',
    name: 'Girls Hostels (LH)',
    category: 'hostel',
    description: 'Women\'s hostel clusters (LH1 - LH3) equipped with tight perimeter security and recreational halls.',
    svgShape: 'polygon',
    coords: '590,390 680,390 680,460 590,460',
    labelX: 635,
    labelY: 430,
  },
  {
    id: 'sports-complex',
    name: 'Indoor Sports Complex',
    category: 'sports',
    description: 'Astate-of-the-art sports dome containing badminton courts, table tennis, and a running track.',
    svgShape: 'rect',
    coords: '270,440,80,50',
    labelX: 310,
    labelY: 470,
  },
  {
    id: 'sac',
    name: 'Student Activity Centre',
    category: 'amenity',
    description: 'Hub for campus clubs, student union offices, practice studios, and auditorium wings.',
    svgShape: 'rect',
    coords: '430,440,80,50',
    labelX: 470,
    labelY: 470,
  }
];

export const blockCFloor1: RoomLayout[] = [
  {
    id: 'c101',
    name: 'C101',
    type: 'classroom',
    description: 'Smart Lecture Classroom (Capacity: 75). Fitted with interactive projectors.',
    x: 100,
    y: 120,
    width: 120,
    height: 90
  },
  {
    id: 'c102',
    name: 'C102',
    type: 'classroom',
    description: 'Advanced Computer Science Seminar Classroom (Capacity: 60). Used for core systems lectures.',
    x: 240,
    y: 120,
    width: 120,
    height: 90
  },
  {
    id: 'c103',
    name: 'C103',
    type: 'classroom',
    description: 'Undergraduate Interactive Room (Capacity: 80). Supports active-learning group tables.',
    x: 380,
    y: 120,
    width: 120,
    height: 90
  },
  {
    id: 'c-faculty-1',
    name: 'Faculty Corridor A',
    type: 'office',
    description: 'Offices of Computer Science professors (Rooms 110 - 125).',
    x: 100,
    y: 230,
    width: 260,
    height: 60
  },
  {
    id: 'c-faculty-2',
    name: 'HOD Office',
    type: 'office',
    description: 'Office of the Head of Department, Computer Science & Engineering.',
    x: 380,
    y: 230,
    width: 120,
    height: 60
  },
  {
    id: 'c-seminar-hall',
    name: 'C-Auditorium',
    type: 'hall',
    description: 'Mini Seminar Auditorium (Capacity: 150). Hosts guest lectures and research symposia.',
    x: 520,
    y: 120,
    width: 180,
    height: 170
  },
  {
    id: 'c-lobby-1',
    name: 'Main Entrance Lobby & Reception',
    type: 'lobby',
    description: 'Spacious entry rotunda. Central staircase, elevators, and campus navigation directory board.',
    x: 240,
    y: 310,
    width: 320,
    height: 70
  }
];

export const blockCFloor2: RoomLayout[] = [
  {
    id: 'c201',
    name: 'C201 (OS Lab)',
    type: 'lab',
    description: 'Operating Systems & Networks Laboratory. Equipped with 60 Linux workstations.',
    x: 100,
    y: 120,
    width: 180,
    height: 90
  },
  {
    id: 'c202',
    name: 'C202',
    type: 'classroom',
    description: 'Standard CSE Lecture Classroom (Capacity: 75). Supports hybrid audio recording.',
    x: 300,
    y: 120,
    width: 120,
    height: 90
  },
  {
    id: 'c203',
    name: 'C203 (AI Lab)',
    type: 'lab',
    description: 'Artificial Intelligence & Robotics Research Lab. Houses GPU rigs and quadcopter platforms.',
    x: 440,
    y: 120,
    width: 260,
    height: 90
  },
  {
    id: 'c-dean-office',
    name: 'Dean SoE Suite',
    type: 'office',
    description: 'Administrative offices of the Dean of School of Engineering.',
    x: 100,
    y: 230,
    width: 180,
    height: 70
  },
  {
    id: 'c-conf-room',
    name: 'SoE Conference Hall',
    type: 'hall',
    description: 'Executive boardroom for academic senate meetings and research collaborations.',
    x: 300,
    y: 230,
    width: 220,
    height: 70
  },
  {
    id: 'c204',
    name: 'C204 (Hardware Lab)',
    type: 'lab',
    description: 'Digital Logic & Microprocessors Lab. Contains FPGA boards and oscilloscope kits.',
    x: 540,
    y: 230,
    width: 160,
    height: 70
  },
  {
    id: 'c-lobby-2',
    name: 'Floor 2 Skywalk Lobby',
    type: 'lobby',
    description: 'Rest area overlooking the Central Lake. Connected to elevators and the library skybridge.',
    x: 200,
    y: 320,
    width: 400,
    height: 60
  }
];

export interface SearchResult {
  building: string;
  room?: string;
  floor?: number;
  highlightId: string;
}

export function parseCampusQuery(query: string): SearchResult | null {
  const clean = query.toLowerCase();

  // Pattern matchers
  if (clean.includes('c102') || clean.includes('c-102')) {
    return { building: 'Block C', room: 'C102', floor: 1, highlightId: 'c102' };
  }
  if (clean.includes('c101') || clean.includes('c-101')) {
    return { building: 'Block C', room: 'C101', floor: 1, highlightId: 'c101' };
  }
  if (clean.includes('c103') || clean.includes('c-103')) {
    return { building: 'Block C', room: 'C103', floor: 1, highlightId: 'c103' };
  }
  if (clean.includes('c201') || clean.includes('c-201') || clean.includes('os lab')) {
    return { building: 'Block C', room: 'C201 (OS Lab)', floor: 2, highlightId: 'c201' };
  }
  if (clean.includes('c202') || clean.includes('c-202')) {
    return { building: 'Block C', room: 'C202', floor: 2, highlightId: 'c202' };
  }
  if (clean.includes('c203') || clean.includes('c-203') || clean.includes('ai lab')) {
    return { building: 'Block C', room: 'C203 (AI Lab)', floor: 2, highlightId: 'c203' };
  }
  if (clean.includes('c204') || clean.includes('c-204') || clean.includes('hardware lab')) {
    return { building: 'Block C', room: 'C204 (Hardware Lab)', floor: 2, highlightId: 'c204' };
  }
  if (clean.includes('dean') || clean.includes('soe suite')) {
    return { building: 'Block C', room: 'Dean SoE Suite', floor: 2, highlightId: 'c-dean-office' };
  }

  // Building checks
  if (clean.includes('block c') || clean.includes('coe') || clean.includes('soe')) {
    return { building: 'Block C', highlightId: 'block-c' };
  }
  if (clean.includes('block a') || clean.includes('shss')) {
    return { building: 'Block A', highlightId: 'block-a' };
  }
  if (clean.includes('block b') || clean.includes('sme')) {
    return { building: 'Block B', highlightId: 'block-b' };
  }
  if (clean.includes('block d') || clean.includes('sns')) {
    return { building: 'Block D', highlightId: 'block-d' };
  }
  if (clean.includes('block e')) {
    return { building: 'Block E', highlightId: 'block-e' };
  }
  if (clean.includes('research block')) {
    return { building: 'Research Block', highlightId: 'research-block' };
  }
  if (clean.includes('library') || clean.includes('central library')) {
    return { building: 'Central Library', highlightId: 'library' };
  }
  if (clean.includes('lake') || clean.includes('central lake')) {
    return { building: 'Central Lake', highlightId: 'lake' };
  }
  if (clean.includes('dining hall 1') || clean.includes('dh1') || clean.includes('dh-1')) {
    return { building: 'Dining Hall 1', highlightId: 'dh1' };
  }
  if (clean.includes('dining hall 2') || clean.includes('dh2') || clean.includes('dh-2')) {
    return { building: 'Dining Hall 2', highlightId: 'dh2' };
  }
  if (clean.includes('dining hall 3') || clean.includes('dh3') || clean.includes('dh-3')) {
    return { building: 'Dining Hall 3', highlightId: 'dh3' };
  }
  if (clean.includes('boys hostel') || clean.includes('boys hostels') || clean.includes('mh')) {
    return { building: 'Boys Hostels (MH)', highlightId: 'mh-hostels' };
  }
  if (clean.includes('girls hostel') || clean.includes('girls hostels') || clean.includes('lh')) {
    return { building: 'Girls Hostels (LH)', highlightId: 'lh-hostels' };
  }
  if (clean.includes('sports complex') || clean.includes('sports dome') || clean.includes('isc')) {
    return { building: 'Indoor Sports Complex', highlightId: 'sports-complex' };
  }
  if (clean.includes('student activity') || clean.includes('sac')) {
    return { building: 'Student Activity Centre', highlightId: 'sac' };
  }

  return null;
}
