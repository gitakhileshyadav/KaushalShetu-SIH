import { Course, CourseAssessment, AssessmentSubmission } from '../types';

export const COMPREHENSIVE_COURSES: Course[] = [
  {
    id: 'crs_poultry_101',
    trainerId: 'usr_trainer_1',
    trainerName: 'Dr. Ramesh Chandra Joshi',
    title: 'Cooperative Poultry Farming & Broiler Management',
    code: 'NCCT-POULTRY-101',
    category: 'Agro-Allied & Poultry Cooperatives',
    description: 'Comprehensive cooperative certification on broiler house construction, automated feeding, brooding temperature calibration, disease prevention, Feed Conversion Ratio (FCR) calculation, and NABARD poultry subsidy schemes.',
    minPassPct: 70,
    minAttendancePct: 75,
    institute: 'RICM Gandhinagar (Agro-Cooperatives Center)',
    createdAt: '2026-02-18',
    totalSessionsExpected: 6,
    thumbnailUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?w=600&auto=format&fit=crop&q=80',
    approvalStatus: 'approved',
    notes: 'NCCT Apex approved master curriculum. Biosecurity and broiler feed conversion ratio standards accredited by Animal Husbandry Division.',
    assessmentId: 'asm_poultry_101',
    modules: [
      {
        id: 'mod_poultry_1',
        title: 'Broiler Shed Design, Temperature & Brooding Setup',
        durationMinutes: 12,
        youtubeVideoId: 'kqtD5dpn9C8', // High quality broiler farming video
        description: 'Learn optimum East-West shed orientation, curtain management, infrared brooder spacing, litter maintenance (sawdust/paddy husk), and week-1 temperature control at 95°F (35°C).',
        learningObjectives: [
          'Calculate stocking density: 1.0 to 1.2 sq.ft per broiler bird',
          'Calibrate brooding temperature reduction by 5°F per week',
          'Design natural tunnel ventilation curtains to prevent ammonia toxicity'
        ],
        pdfResources: [
          {
            id: 'pdf_poultry_shed_sop',
            title: 'Broiler Shed Engineering & Brooding SOP Manual',
            filename: 'NCCT_Poultry_Broiler_Shed_SOP_v2.pdf',
            pageCount: 16,
            author: 'NCCT Agricultural Engineering Division',
            department: 'Animal Husbandry & Dairying Wing',
            summary: 'National technical specifications for climate-controlled poultry sheds, hover brooder electrical wiring, ventilation CFM calculations, and floor space norms.',
            chapters: [
              {
                page: 1,
                title: 'Section 1: Shed Orientation & Microclimate Management',
                content: 'Broiler sheds must always be constructed with the long axis running strictly East to West to prevent direct harsh sun rays falling into the sidewalls. The side walls should not exceed 1.0 to 1.2 feet in height from the floor level, above which heavy galvanized wire netting (1/2 inch to 1 inch mesh) is fitted up to 6 to 7 feet. Overhang of the roof must be at least 3.5 to 4.0 feet to deflect monsoon showers.',
                highlights: [
                  'East-West orientation minimizes direct solar heat radiation',
                  'Roof overhang minimum 3.5 feet protects litter from rainwater ingress',
                  'Center ridge height must be 12 to 14 feet for hot Indian climatic zones'
                ],
                keyTerms: [
                  { term: 'Hover Brooder', definition: 'Conical canopy with heating lamps or gas radiant heaters to keep chicks warm.' },
                  { term: 'CFM (Cubic Feet per Minute)', definition: 'Airflow velocity standard for poultry ventilation fans.' }
                ],
                diagramDescription: 'Cross-sectional architectural schematic showing ridge cap, roof slope 1:3, curtain winch mechanism, and raised concrete plinth.'
              },
              {
                page: 2,
                title: 'Section 2: Brooding Temperature Schedules & Chick Guards',
                content: 'Chicks lack thermoregulatory capacity for the first 10 days of life. The brooding temperature measured 2 inches above litter level under the hover must start at 95°F (35°C) during Week 1, and be systematically lowered by 5°F each week until ambient temperature (70-75°F) is reached by Week 4 to 5. Chick guards made of corrugated cardboard (18 inches height) must be positioned in a circle 3 feet away from the hover edge.',
                highlights: [
                  'Day 1-7: Maintain 95°F (35°C) strictly',
                  'Day 8-14: Maintain 90°F (32°C)',
                  'Day 15-21: Maintain 85°F (29°C)',
                  'Chick distribution behavior is the most reliable temperature indicator'
                ],
                keyTerms: [
                  { term: 'Huddling', definition: 'Chicks crowding under heater indicates cold stress; requires immediate thermostat adjustment.' },
                  { term: 'Panting', definition: 'Chicks gasping with open beaks away from heater indicates dangerously high brooder heat.' }
                ]
              },
              {
                page: 3,
                title: 'Section 3: Litter Management & Ammonia Prevention',
                content: 'Quality litter absorbs bird droppings, dilutes faecal material, and insulates chicks from cold concrete floors. Use dry, mold-free paddy husk or wood shavings at a depth of 2 inches during summer and 3 to 4 inches during winter. Litter moisture must be maintained between 20% and 25%. If moisture exceeds 30%, rake daily and apply hydrated lime at 5 kg per 100 sq.ft to prevent ammonia fumes.',
                highlights: [
                  'Target litter moisture: 20% to 25%',
                  'Ammonia fumes above 20 ppm cause eye burning and respiratory vulnerability in broilers',
                  'Turn litter twice weekly to prevent caking under water nipple lines'
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'mod_poultry_2',
        title: 'Nutritional Feed Formulation, Water Sanitation & FCR Math',
        durationMinutes: 15,
        youtubeVideoId: '4q1ZpjTC1zw', // Educational poultry feed & nutrition
        description: 'Master commercial pre-starter, starter, and finisher rations, automatic bell drinker sanitation, water acidification (pH 6.0), and calculate Feed Conversion Ratio (FCR).',
        learningObjectives: [
          'Formulate Pre-starter (23% CP), Starter (21.5% CP), and Finisher (19.5% CP) feeds',
          'Calculate Feed Conversion Ratio: Total Feed Consumed (kg) / Total Live Body Weight (kg)',
          'Implement chlorine dosing (3-5 ppm free chlorine) for nipple drinker pipelines'
        ],
        pdfResources: [
          {
            id: 'pdf_poultry_nutrition_guide',
            title: 'Cooperative Poultry Feeding & FCR Optimization Chart',
            filename: 'NCCT_Poultry_Nutritional_Specifications.pdf',
            pageCount: 12,
            author: 'NCCT Dairy & Allied Agricultural Wing',
            department: 'Livestock Feeds Standardization Committee',
            summary: 'Comprehensive crude protein (CP) tables, metabolizable energy (ME kcal/kg) requirements, and cooperative collective feed procurement standards.',
            chapters: [
              {
                page: 1,
                title: 'Chapter 1: Three-Phase Broiler Feeding Regimen',
                content: 'Modern commercial broilers reach 2.0 to 2.2 kg live market weight within 35 to 40 days when fed on precision three-phase diets. Pre-starter crumbs (0 to 10 days) contain 23% Crude Protein and 3000 kcal ME/kg. Starter pellets (11 to 24 days) contain 21.5% CP and 3100 kcal ME/kg. Finisher pellets (25 days to marketing) provide 19.5% CP and 3200 kcal ME/kg for maximum muscle accretion.',
                highlights: [
                  'Pre-starter (Day 0-10): 23.0% CP, 3000 kcal/kg ME',
                  'Starter (Day 11-24): 21.5% CP, 3100 kcal/kg ME',
                  'Finisher (Day 25-Sale): 19.5% CP, 3200 kcal/kg ME'
                ]
              },
              {
                page: 2,
                title: 'Chapter 2: Feed Conversion Ratio (FCR) Mathematical Calculation',
                content: 'Feed Conversion Ratio (FCR) is the single most critical financial performance indicator in cooperative poultry farming. FCR is defined as total kilograms of feed consumed divided by total kilograms of live body weight attained. A lower FCR indicates superior feed efficiency and profitability. Target modern broiler FCR is 1.50 to 1.60 at 35 days.',
                highlights: [
                  'Formula: FCR = Total Feed Consumed (kg) ÷ Total Live Weight Sold (kg)',
                  'Example: 5,000 birds consume 16,000 kg feed and yield 10,000 kg weight -> FCR = 1.60',
                  'Each 0.05 improvement in FCR increases cooperative farmer margin by ₹3.50 per bird'
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'mod_poultry_3',
        title: 'Biosecurity Protocols, Vaccination Schedule & Disease Control',
        durationMinutes: 14,
        youtubeVideoId: 'y881t8ilMyc', // Biosecurity and poultry vaccination
        description: 'Detailed protocols for foot baths, disinfection with quaternary ammonium compounds, Newcastle Disease (Ranikhet / F1 / Lasota) and Infectious Bursal Disease (Gumboro) vaccination programs.',
        learningObjectives: [
          'Administer Lasota / F1 eye-drop vaccine at Day 5-7',
          'Administer Gumboro (IBD Intermediate Plus) oral vaccine at Day 12-14',
          'Enforce strict visitor and vehicle tire dip biosecurity barriers'
        ],
        pdfResources: [
          {
            id: 'pdf_poultry_biosecurity_rules',
            title: 'National Poultry Biosecurity & Vaccination Handbook',
            filename: 'NCCT_Poultry_Biosecurity_Protocols_2026.pdf',
            pageCount: 14,
            author: 'Veterinary Council of India & NCCT',
            department: 'Preventive Veterinary Healthcare',
            summary: 'Statutory biosecurity isolation zones, cold-chain vaccine storage at 2°C to 8°C, and disposal SOPs for mortality management.',
            chapters: [
              {
                page: 1,
                title: 'Chapter 1: The Three Pillars of Poultry Biosecurity',
                content: 'Biosecurity comprises Conceptual, Structural, and Operational measures. Conceptual isolation requires locating the farm at least 500 meters away from other commercial poultry farms and major highways. Structural measures include physical fencing, wheel tire bath dips filled with 2% sodium carbonate or bleach, and dedicated personnel shower blocks. Operational biosecurity requires all-in all-out single-age flock management.',
                highlights: [
                  'Minimum 500 meters buffer zone from foreign poultry holdings',
                  'All-in All-out flock placement prevents pathogen transmission between ages',
                  'Foot dip solution must be replenished every 48 hours'
                ]
              },
              {
                page: 2,
                title: 'Chapter 2: Mandatory Vaccination Calendar for Broilers',
                content: 'Vaccines must be transported in insulated ice boxes maintaining 2°C to 8°C. Never expose live viral vaccines to direct sunlight or chlorinated water. Reconstitute eye drops using distilled sterile diluent provided with the vial. Add skim milk powder (2.5 g per liter of drinking water) as a stabilizer 20 minutes before administering oral IBD vaccines.',
                highlights: [
                  'Day 5 to 7: Ranikhet Disease (RD / Lasota) - Intraocular / Intranasal drop',
                  'Day 12 to 14: Infectious Bursal Disease (IBD / Gumboro) - Drinking water with stabilizer',
                  'Day 21 to 24: Ranikhet Disease Booster (Lasota strain) - Drinking water administration'
                ]
              }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'crs_electrician_201',
    trainerId: 'usr_trainer_2',
    trainerName: 'Prof. Sunita Deshmukh',
    title: 'Rural Cooperative Electrician & House Wiring Fundamentals',
    code: 'NCCT-ELEC-201',
    category: 'Rural Technical Skills & Electrification',
    description: 'Hands-on vocational curriculum covering domestic single-phase and three-phase wiring, earthing resistance measurement, MCB/RCCB sizing, agricultural pump motor starters, and Bureau of Indian Standards (IS 732) safety compliance.',
    minPassPct: 70,
    minAttendancePct: 75,
    institute: 'VAMNICOM Pune (Rural Electrification Cell)',
    createdAt: '2026-02-20',
    totalSessionsExpected: 6,
    thumbnailUrl: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?w=600&auto=format&fit=crop&q=80',
    approvalStatus: 'approved',
    notes: 'Approved by NCCT Technical Division. Includes IS 732 compliance and solar water pump integration.',
    assessmentId: 'asm_electrician_201',
    modules: [
      {
        id: 'mod_elec_1',
        title: 'Electrical Safety, Pipe Earthing & Shock Prevention',
        durationMinutes: 14,
        youtubeVideoId: '2e_bVn28hQ8', // Electrical safety & earthing video
        description: 'Understand Ohm’s Law, electric shock physiology, proper chemical and GI pipe earthing installation, and measuring earth resistance below 5 Ohms using a digital Earth Megger.',
        learningObjectives: [
          'Install GI pipe and copper plate earthing with charcoal and salt layers',
          'Measure earth loop impedance using a 4-terminal Digital Earth Tester',
          'Select correct wire gauge (1.5 sq.mm for lighting, 2.5 to 4.0 sq.mm for power sockets)'
        ],
        pdfResources: [
          {
            id: 'pdf_elec_earthing_guide',
            title: 'IS 3043 Code of Practice for Earthing & Electrical Safety',
            filename: 'NCCT_IS3043_Earthing_Safety_HandBook.pdf',
            pageCount: 18,
            author: 'Bureau of Indian Standards & NCCT Technical Cell',
            department: 'Rural Electrification & Safety Council',
            summary: 'Comprehensive diagrams of pipe earthing pits, chemical earthing compounds, soil resistivity tables, and personal protective equipment (PPE) standards.',
            chapters: [
              {
                page: 1,
                title: 'Chapter 1: The Physics of Electric Shock and Body Impedance',
                content: 'Current passing through the human body, not voltage alone, causes physiological injury. An alternating current (AC) of 50 Hz as low as 10 to 20 mA causes severe muscular contraction (let-go threshold). Current above 50 to 100 mA through the heart causes ventricular fibrillation within seconds. Hence, Residual Current Circuit Breakers (RCCBs) with a 30 mA tripping sensitivity are mandatory for all domestic installations under Central Electricity Authority regulations.',
                highlights: [
                  '1 mA: Threshold of perception',
                  '10 - 20 mA: Painful shock, loss of muscular control (let-go threshold)',
                  '30 mA: Mandatory RCCB tripping sensitivity for human protection',
                  '100 mA+: Potential fatal ventricular fibrillation'
                ],
                keyTerms: [
                  { term: 'Let-go current', definition: 'Maximum current a person can endure while still able to release energized conductor.' },
                  { term: 'Step Potential', definition: 'Voltage between feet of person standing near an energized grounded fault.' }
                ]
              },
              {
                page: 2,
                title: 'Chapter 2: Pipe Earthing Construction as per IS 3043',
                content: 'A standard GI pipe electrode must have a diameter of not less than 38 mm for galvanized iron or steel and a minimum length of 2.5 meters. The pipe is perforated with 12 mm holes at intervals of 7.5 cm. It is placed vertically in an excavated pit surrounded by alternate layers of charcoal and sodium chloride (common salt) each 15 cm thick to retain moisture and reduce soil resistivity.',
                highlights: [
                  'GI pipe diameter minimum 38 mm, length minimum 2.5 meters',
                  'Charcoal and salt layers improve soil conductivity around the electrode',
                  'Earth resistance must not exceed 5.0 Ohms for domestic and 1.0 Ohm for substations'
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'mod_elec_2',
        title: 'Single Phase Domestic Conduit Wiring & Switchboard Assembly',
        durationMinutes: 16,
        youtubeVideoId: 'fJ9rUzIMcZQ', // House wiring and switchboard
        description: 'Step-by-step assembly of PVC conduit pipe systems, loop-in wiring method, color coding (Red/Black/Green-Yellow), two-way staircase wiring, and main distribution board (MDB) layout.',
        learningObjectives: [
          'Color code correctly: Phase (Red/Brown), Neutral (Black/Blue), Earth (Green/Yellow)',
          'Assemble 6-module and 8-module modular switchboards with switches, sockets, and fan regulators',
          'Wire a two-way staircase circuit using SPDT switches'
        ],
        pdfResources: [
          {
            id: 'pdf_elec_wiring_manual',
            title: 'Domestic Wiring & Circuit Schematics Manual (IS 732)',
            filename: 'NCCT_Domestic_House_Wiring_Manual.pdf',
            pageCount: 22,
            author: 'NCCT National Vocational Training Division',
            department: 'Electrical Trade Standards',
            summary: 'Color schematics for loop-in systems, staircase circuits, ceiling fan connections with capacitors, and sub-circuit sizing tables.',
            chapters: [
              {
                page: 1,
                title: 'Section 1: Conductor Sizing & Color Code Rules',
                content: 'All wiring must use multi-strand copper conductors with FR (Flame Retardant) PVC insulation. Minimum conductor cross-sections: Lighting circuits = 1.5 sq.mm; Power sockets (16A for geysers, air conditioners) = 2.5 to 4.0 sq.mm; Sub-main incoming feeder cables = 6.0 to 10.0 sq.mm. Phase wire must always be routed through the switch, never the neutral wire, to prevent energized sockets when switch is in OFF position.',
                highlights: [
                  'Phase conductor must always be interrupted by the single-pole switch',
                  'Lighting circuit: 1.5 sq.mm copper (max 800W or 10 points per sub-circuit)',
                  'Power circuit: 2.5 to 4.0 sq.mm copper (max 2000W or 2 points per sub-circuit)'
                ]
              },
              {
                page: 2,
                title: 'Section 2: Two-Way Staircase Switch Circuit Diagram',
                content: 'Staircase lighting allows controlling a single lamp from two different locations (e.g., bottom and top of stairs) using two Single Pole Double Throw (SPDT / 2-way) switches. Phase wire is connected to the common terminal of Switch 1. The two traveler terminals of Switch 1 are cross-connected to the two traveler terminals of Switch 2. The common terminal of Switch 2 connects to the lamp load, which returns to Neutral.',
                highlights: [
                  'Uses two 2-way (SPDT) switches with 3 terminals each',
                  'Phase connected to Switch 1 Common; Lamp connected to Switch 2 Common',
                  'Allows independent toggling from either location without intermediate short circuits'
                ]
              }
            ]
          }
        ]
      },
      {
        id: 'mod_elec_3',
        title: 'Multimeter Diagnostics, Circuit Breakers (MCB/RCCB) & Motor Starters',
        durationMinutes: 18,
        youtubeVideoId: 'O-aL53tH900', // Multimeter diagnostics & circuit breakers
        description: 'Learn to measure AC voltage, DC voltage, resistance, and continuity using a Digital Multimeter (DMM). Calculate MCB tripping curve (B, C, D type) and wire Direct-On-Line (DOL) agricultural pump starters.',
        learningObjectives: [
          'Perform continuity and insulation resistance tests on domestic circuits',
          'Select B-curve MCBs for resistive lighting and C-curve MCBs for inductive motor loads',
          'Diagnose single phasing and thermal overload relay tripping in 3-phase pump motors'
        ],
        pdfResources: [
          {
            id: 'pdf_elec_troubleshooting_handbook',
            title: 'Motor Starter Wiring & Multimeter Troubleshooting Guide',
            filename: 'NCCT_Motor_Starter_Diagnostics_Guide.pdf',
            pageCount: 16,
            author: 'NCCT Agricultural Mechanics Wing',
            department: 'Rural Cooperative Electrification Cell',
            summary: 'Wiring schematics for Contactor coils, No-Volt Coils (NVC), Thermal Overload Relays (TOR), and digital multimeter safety CAT-III ratings.',
            chapters: [
              {
                page: 1,
                title: 'Chapter 1: MCB Characteristics and Tripping Curves',
                content: 'Miniature Circuit Breakers (MCBs) provide both thermal protection (bimetallic strip for overloads) and magnetic protection (solenoid coil for short circuits). Type B MCBs trip between 3 to 5 times rated current (ideal for domestic lighting and electronic appliances). Type C MCBs trip between 5 to 10 times rated current (handles initial inrush current of fans, refrigerators, and fluorescent ballasts). Type D MCBs trip between 10 to 20 times rated current for heavy agricultural pumps and motors.',
                highlights: [
                  'Type B: 3 to 5 x In (Domestic resistive heating, computers, LED lighting)',
                  'Type C: 5 to 10 x In (Air conditioners, water pumps, inductive motors)',
                  'RCCB must be tested monthly by depressing the mechanical "Test (T)" button'
                ]
              },
              {
                page: 2,
                title: 'Chapter 2: Direct-On-Line (DOL) Starter for 3-Phase Agricultural Pumps',
                content: 'Cooperative farmers rely on 3-phase induction motors (3 HP to 7.5 HP) for tubewell irrigation. A DOL starter connects the 415V supply directly across the motor stator windings. It consists of a 3-pole magnetic contactor, a 415V No-Volt Release coil, an auxiliary latching contact (13-14 NO), Start and Stop push buttons, and a bimetallic Thermal Overload Relay (TOR) set to 1.15 times the motor rated full-load current.',
                highlights: [
                  'Protects motor against dangerous single-phasing (phase loss)',
                  'Thermal Overload Relay prevents stator winding burn-out under jammed impeller',
                  'No-Volt Coil ensures automatic disconnection during power outages'
                ]
              }
            ]
          }
        ]
      }
    ]
  }
];

export const COMPREHENSIVE_ASSESSMENTS: CourseAssessment[] = [
  {
    id: 'asm_poultry_101',
    courseId: 'crs_poultry_101',
    courseTitle: 'Cooperative Poultry Farming & Broiler Management',
    title: 'Poultry Farm Broiler & Biosecurity Master Certification Exam',
    description: 'National assessment evaluating competency in broiler housing architecture, brooding temperature schedules, FCR economics, water sanitation, and mandatory vaccination protocols.',
    timeLimitMinutes: 15,
    passingScorePct: 70,
    questions: [
      {
        id: 'pq_1',
        questionText: 'What is the recommended directional orientation for commercial broiler sheds in India to minimize direct solar heating?',
        options: [
          'North to South orientation',
          'East to West orientation',
          'North-East to South-West orientation',
          'Any orientation provided side curtains are closed'
        ],
        correctOptionIndex: 1,
        explanation: 'Broiler sheds must be built with the long axis running strictly East to West to prevent direct sunshine from penetrating side walls during sunrise and sunset.',
        category: 'Housing & Environment'
      },
      {
        id: 'pq_2',
        questionText: 'What is the required brooding temperature under the hover during the first week of a broiler chick’s life?',
        options: [
          '80°F (26.6°C)',
          '85°F (29.4°C)',
          '95°F (35.0°C)',
          '105°F (40.5°C)'
        ],
        correctOptionIndex: 2,
        explanation: 'Day-old chicks cannot self-regulate body heat. Week 1 brooding temperature must be strictly 95°F (35°C), lowered by 5°F each subsequent week.',
        category: 'Brooding & Physiology'
      },
      {
        id: 'pq_3',
        questionText: 'How is the Feed Conversion Ratio (FCR) of a broiler batch mathematically calculated?',
        options: [
          'Total Birds Sold ÷ Total Mortality Count',
          'Total Kilograms of Feed Consumed ÷ Total Kilograms of Live Body Weight Gained',
          'Total Feed Cost (₹) ÷ Number of Chicks Placed',
          'Total Live Weight (kg) ÷ Number of Days in Shed'
        ],
        correctOptionIndex: 1,
        explanation: 'FCR = Total Feed Consumed (kg) / Total Live Body Weight (kg). A lower FCR indicates superior feed efficiency.',
        category: 'Economics & Nutrition'
      },
      {
        id: 'pq_4',
        questionText: 'At what age should the initial Ranikhet Disease (Newcastle Disease / Lasota strain) vaccine be administered to broiler chicks?',
        options: [
          'Day 1 immediately at hatching',
          'Day 5 to 7 via eye/nose drop',
          'Day 28 via subcutaneous injection',
          'Only when symptoms appear'
        ],
        correctOptionIndex: 1,
        explanation: 'Primary RD (Lasota/F1) vaccine is universally administered between Day 5 and 7 as an intraocular or intranasal drop.',
        category: 'Biosecurity & Vaccination'
      },
      {
        id: 'pq_5',
        questionText: 'What is the standard floor space allocation recommended per broiler bird at market age (6 weeks)?',
        options: [
          '0.2 to 0.4 sq.ft per bird',
          '1.0 to 1.2 sq.ft per bird',
          '3.0 to 4.0 sq.ft per bird',
          '5.0 sq.ft per bird'
        ],
        correctOptionIndex: 1,
        explanation: 'In open-sided houses in tropical climates, broilers require 1.0 to 1.2 square feet per bird for healthy growth without overcrowding.',
        category: 'Housing & Space'
      },
      {
        id: 'pq_6',
        questionText: 'What stabilizing agent should be added to drinking water 20 minutes before administering oral live IBD (Gumboro) vaccine?',
        options: [
          'Bleaching powder at 10 ppm',
          'Skim milk powder at 2.5 grams per liter of water',
          'Copper sulfate solution at 5%',
          'Hydrated lime powder'
        ],
        correctOptionIndex: 1,
        explanation: 'Skim milk powder neutralizes minor trace chlorine and protects fragile live viral vaccine organisms during water distribution.',
        category: 'Biosecurity & Vaccination'
      },
      {
        id: 'pq_7',
        questionText: 'If 4,000 broilers consume 12,800 kg of feed and achieve a total live weight of 8,000 kg, what is the batch FCR?',
        options: [
          '1.85',
          '1.60',
          '1.40',
          '2.10'
        ],
        correctOptionIndex: 1,
        explanation: '12,800 kg feed ÷ 8,000 kg live weight = 1.60 FCR.',
        category: 'Economics & Nutrition'
      },
      {
        id: 'pq_8',
        questionText: 'What dangerous gas, produced when damp litter mixes with uric acid droppings, causes keratoconjunctivitis and respiratory distress above 20 ppm?',
        options: [
          'Carbon Monoxide (CO)',
          'Ammonia gas (NH3)',
          'Sulfur Dioxide (SO2)',
          'Methane (CH4)'
        ],
        correctOptionIndex: 1,
        explanation: 'Ammonia gas (NH3) volatilizes rapidly from damp litter (>30% moisture), irritating avian eyes and respiratory tracheae.',
        category: 'Health & Litter Management'
      }
    ]
  },
  {
    id: 'asm_electrician_201',
    courseId: 'crs_electrician_201',
    courseTitle: 'Rural Cooperative Electrician & House Wiring Fundamentals',
    title: 'Rural Electrician & Practical Wiring Competency Exam',
    description: 'Statutory examination evaluating knowledge of Indian Electricity Rules (IS 732 / IS 3043), circuit protection, earthing resistance, multimeter diagnosis, and pump motor starter wiring.',
    timeLimitMinutes: 15,
    passingScorePct: 70,
    questions: [
      {
        id: 'eq_1',
        questionText: 'According to Indian Electricity Rules and CEA standards, what is the maximum permissible tripping current of an RCCB for domestic human shock protection?',
        options: [
          '100 mA',
          '30 mA',
          '300 mA',
          '500 mA'
        ],
        correctOptionIndex: 1,
        explanation: 'A 30 mA RCCB trips in milliseconds before lethal ventricular fibrillation can occur in the human heart during shock.',
        category: 'Safety & Protection'
      },
      {
        id: 'eq_2',
        questionText: 'What is the statutory color code for the Protective Earth conductor in Indian and international electrical installations?',
        options: [
          'Solid Black',
          'Solid Blue',
          'Green or Green with Yellow stripes',
          'Red with White stripes'
        ],
        correctOptionIndex: 2,
        explanation: 'As per IS 732, Green or Green-with-Yellow stripe insulation is exclusively reserved for the protective earth conductor.',
        category: 'Conduit & Wiring Codes'
      },
      {
        id: 'eq_3',
        questionText: 'For domestic installations, what is the maximum acceptable earth electrode resistance as measured with an Earth Tester?',
        options: [
          'Not more than 5.0 Ohms',
          'Between 25 and 50 Ohms',
          'Over 100 Ohms',
          'Resistance does not matter if salt is added'
        ],
        correctOptionIndex: 0,
        explanation: 'IS 3043 mandates that domestic earth electrode resistance shall not exceed 5 Ohms (and ideally below 2 Ohms for sensitive equipment).',
        category: 'Earthing & IS 3043'
      },
      {
        id: 'eq_4',
        questionText: 'In single-phase AC domestic circuits, why MUST the control switch be installed in the Phase (Live) wire rather than the Neutral wire?',
        options: [
          'Because phase wire has lower electrical resistance',
          'To ensure that when switch is OFF, the appliance is completely de-energized and safe to touch',
          'To make the incandescent bulb shine brighter',
          'Neutral wire cannot conduct current when switched'
        ],
        correctOptionIndex: 1,
        explanation: 'If a switch is placed on the neutral, the appliance remains energized at 230V even when turned off, posing a severe shock hazard.',
        category: 'Circuit Principles'
      },
      {
        id: 'eq_5',
        questionText: 'Which type of Miniature Circuit Breaker (MCB) curve is specifically recommended for inductive motor loads like air conditioners and water pumps?',
        options: [
          'Type A MCB',
          'Type B MCB',
          'Type C MCB (5 to 10 x In)',
          'Type Z MCB'
        ],
        correctOptionIndex: 2,
        explanation: 'Type C MCBs tolerate 5 to 10 times rated current temporarily, accommodating the high startup inrush surge of electric motors without false tripping.',
        category: 'Circuit Protection'
      },
      {
        id: 'eq_6',
        questionText: 'What protective function does the Thermal Overload Relay (TOR) perform in a 3-phase agricultural pump motor starter?',
        options: [
          'Provides instantaneous short-circuit magnetic blast protection',
          'Disconnects motor when sustained continuous over-current causes bimetallic strip heating',
          'Converts AC voltage into smooth DC voltage',
          'Automatically reverses motor rotation direction'
        ],
        correctOptionIndex: 1,
        explanation: 'The TOR contains calibrated bimetallic strips that bend when prolonged high current flows, tripping the contactor before windings burn out.',
        category: 'Motor Starters & Pumps'
      },
      {
        id: 'eq_7',
        questionText: 'When testing a disconnected electric water heating element with a digital multimeter set to the Ohms (Resistance) range, what does a reading of 0.00 Ohms indicate?',
        options: [
          'The heating element is in perfect working order',
          'The heating element is completely open-circuited (burnt filament)',
          'The heating element has an internal dead short circuit',
          'The multimeter battery is depleted'
        ],
        correctOptionIndex: 2,
        explanation: 'A normal 2000W element should measure approximately 26 Ohms (R = V^2 / P). A reading of 0.00 Ohms indicates a dead short circuit.',
        category: 'Diagnostics & Multimeter'
      },
      {
        id: 'eq_8',
        questionText: 'How many terminals does a Single Pole Double Throw (SPDT / 2-way) switch possess for staircase wiring?',
        options: [
          '2 terminals',
          '3 terminals (One common, two travelers)',
          '4 terminals',
          '6 terminals'
        ],
        correctOptionIndex: 1,
        explanation: 'A 2-way switch has 3 terminals: one common terminal and two traveler/strapping terminals.',
        category: 'Conduit & Wiring Codes'
      }
    ]
  }
];

export const INITIAL_SUBMISSIONS: AssessmentSubmission[] = [
  {
    id: 'sub_poultry_1',
    assessmentId: 'asm_poultry_101',
    courseId: 'crs_poultry_101',
    courseTitle: 'Cooperative Poultry Farming & Broiler Management',
    traineeId: 'usr_trainee_1',
    traineeName: 'Aarav Sharma',
    institute: 'RICM Gandhinagar',
    scorePct: 87.5,
    totalQuestions: 8,
    correctAnswersCount: 7,
    passed: true,
    submittedAt: '2026-03-02T11:40:00Z',
    answers: { pq_1: 1, pq_2: 2, pq_3: 1, pq_4: 1, pq_5: 1, pq_6: 1, pq_7: 1, pq_8: 0 },
    certificateNumber: 'NCCT-CERT-2026-PLT-8821',
    trainerApproved: true,
    trainerRemarks: 'Exemplary mastery of brooding temperatures and biosecurity sanitation protocols.'
  },
  {
    id: 'sub_electrician_1',
    assessmentId: 'asm_electrician_201',
    courseId: 'crs_electrician_201',
    courseTitle: 'Rural Cooperative Electrician & House Wiring Fundamentals',
    traineeId: 'usr_trainee_2',
    traineeName: 'Pooja Verma',
    institute: 'VAMNICOM, Pune',
    scorePct: 100,
    totalQuestions: 8,
    correctAnswersCount: 8,
    passed: true,
    submittedAt: '2026-03-04T15:20:00Z',
    answers: { eq_1: 1, eq_2: 2, eq_3: 0, eq_4: 1, eq_5: 2, eq_6: 1, eq_7: 2, eq_8: 1 },
    certificateNumber: 'NCCT-CERT-2026-ELC-9014',
    trainerApproved: true,
    trainerRemarks: 'Perfect score on electrical safety regulations, earthing resistance, and motor starter schematics.'
  }
];
