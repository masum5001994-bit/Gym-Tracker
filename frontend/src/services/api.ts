import axios from 'axios';
import { doc, getDoc, setDoc, collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db, auth } from './firebase';


import {
  Routine,
  Exercise,
  WorkoutLog,
  VolumeMatrixEntry,
  ExerciseHistoryResponse,
  ExerciseHistoryPoint,
  AnalyticsSummary,
  UserProfile,
  LiveExerciseLog,
} from '../types';
import { prepareActiveDraftPayload } from './setSync';


const API_BASE = '/api';
const LOCAL_STORAGE_WORKOUTS_KEY = 'bws_gym_tracker_workouts_v1';

// BWS Presets Fallback Data for Static Firebase Hosting
const FALLBACK_EXERCISES: Exercise[] = [
  // Upper Body / Chest & Back
  {
    id: 'ex-bench-press',
    name: 'Barbell Bench Press',
    category: 'Chest',
    defaultSets: 3,
    targetReps: '8-10',
    minReps: 8,
    maxReps: 10,
    restSeconds: 150,
    notes: 'Grip slightly outside shoulder-width, keep chest up, lower bar to level of nipples, avoid flaring elbows out.',
    pdfPage: 'Page 6',
    step1Setup: 'Lie down on the bench with eyes directly below racked bar. Use medium grip slightly wider than shoulder-width. Pull shoulder blades down/together to create small arch in lower back. Plant feet firmly.',
    step2Execution: 'Control weight down with elbows at 45-60 degree angle from torso. Lower until bar touches chest at sternum level.',
    step3Execution: 'Push bar up and back to starting position until arms fully lock out over shoulders.',
    additionalTips: 'Avoid bouncing bar against chest. Use control to touch chest lightly and use a spotter with heavy loads.',
    alternatives: ['Flat Dumbbell Press (https://youtu.be/g14dhC5KYBM)', 'Flat Machine Chest Press (https://youtu.be/sO8lFa9CidE)'],
  },
  {
    id: 'ex-db-chest-row',
    name: 'DB Chest Supported Row',
    category: 'Back',
    defaultSets: 3,
    targetReps: '10-12',
    minReps: 10,
    maxReps: 12,
    restSeconds: 120,
    notes: 'Set bench 2 notches up from bottom (30 deg), angle elbows out 45-60 deg, squeeze shoulder blades together.',
    pdfPage: 'Page 7',
    step1Setup: 'Set incline bench to ~30 degrees (second notch). Lay chest on bench with thumbless grip on dumbbells and arms hanging down.',
    step2Execution: 'Pull elbows back behind body at 45-60 degree angle away from torso. Squeeze shoulder blades together at top.',
    step3Execution: 'Control weight back down to starting position, letting shoulder blades open up before next rep.',
    additionalTips: 'Think about pulling with your elbows each rep to maximize lat and upper back activation.',
    alternatives: ['Barbell Row (mid/upper back) (https://youtu.be/FTCmwlfZ29A)', 'Seated Cable Row (https://youtu.be/Q-5V5T55giY)'],
  },
  {
    id: 'ex-ohp',
    name: 'Standing Barbell OHP',
    category: 'Shoulders',
    defaultSets: 3,
    targetReps: '6-8',
    minReps: 6,
    maxReps: 8,
    restSeconds: 150,
    notes: 'Press in straight line up, keep core and glutes engaged, avoid arching back or leg driving.',
    pdfPage: 'Page 8',
    step1Setup: 'Set bar in rack at armpit height. Grip just outside shoulder-width with forearms vertical. Step back with feet shoulder-width apart.',
    step2Execution: 'Squeeze glutes and brace core. Press bar vertically up, slightly tilting chin back until bar passes head, then press straight overhead to lock out.',
    step3Execution: 'Inhale and lower bar under control to upper chest with elbows at 45 degree angle in front.',
    additionalTips: 'Keep this a strict press by using only your upper body without bending knees or leg drive.',
    alternatives: ['Seated DB Shoulder Press (https://youtu.be/DPXG3BJvl8A)', 'Standing DB Shoulder Press (https://youtu.be/jWriqmLrQqs)'],
  },
  {
    id: 'ex-lat-pulldown',
    name: 'Lat Pulldown',
    category: 'Back',
    defaultSets: 3,
    targetReps: '8-10',
    minReps: 8,
    maxReps: 10,
    restSeconds: 120,
    notes: 'Grip outside shoulder width, lean back slightly (15 deg), pull bar to just under chin focusing on elbows.',
    pdfPage: 'Page 9',
    step1Setup: 'Adjust seat knee pads securely. Grab bar overhand outside shoulder-width. Sit with thighs locked under pad, leaning torso slightly back.',
    step2Execution: 'Pull elbows down and back until bar reaches chin level. Depress shoulder blades at top.',
    step3Execution: 'Control weight back up until arms are almost fully extended.',
    additionalTips: 'Try using a thumbless grip and pull through elbows rather than hands to isolate lats.',
    alternatives: ['Weighted Pull-Ups (https://youtu.be/w_yuTRQd6HA)', '3 Point Dumbbell Row (https://youtu.be/hrBLmuQ_vq8)'],
  },
  {
    id: 'ex-high-low-cable-fly',
    name: 'Standing High-to-Low Cable Flyes',
    category: 'Chest',
    defaultSets: 3,
    targetReps: '10-15',
    minReps: 10,
    maxReps: 15,
    restSeconds: 90,
    notes: 'Set cables to highest position, use staggered stance, squeeze arms together down in front of hips.',
    pdfPage: 'Page 10',
    step1Setup: 'Set pulleys at highest position. Stand staggered in front with arms down in front of body and palms facing.',
    step2Execution: 'Control weight up with soft elbow bend to shoulder height, then squeeze lower chest to bring hands together down in front of hips.',
    step3Execution: 'Pause at bottom peak contraction before returning to starting position.',
    additionalTips: 'Think about bringing biceps together at bottom to maximize lower chest contraction.',
    alternatives: ['Decline Dumbbell Press (https://youtu.be/pSOseCLdzIY)', 'Banded Decline Push-Ups (https://youtu.be/LdahU9kB-u0)'],
  },
  {
    id: 'ex-cable-lateral-raise',
    name: 'Cable Lateral Raises',
    category: 'Shoulders',
    defaultSets: 3,
    targetReps: '15-20',
    minReps: 15,
    maxReps: 20,
    restSeconds: 90,
    notes: 'Raise arm in scapular plane (15-30 deg forward), align cable with arm, think of pushing hand out not up.',
    pdfPage: 'Page 11',
    step1Setup: 'Attach handle to bottom pulley. Stand facing away from cable and reach behind body to grab handle.',
    step2Execution: 'Brace core and raise arm diagonally in scapular plane (15-30 degrees forward) up to shoulder height.',
    step3Execution: 'Lower under control back down behind thigh and repeat before switching arms.',
    additionalTips: 'Think about reaching hand out towards walls rather than pulling straight up to eliminate trap cheating.',
    alternatives: ['Dumbbell Lateral Raise (https://youtu.be/zcO3sgAeLA0)', 'Lying Incline Lateral Raise (https://youtu.be/upEqeI0F73M)'],
  },

  // Lower Body 1
  {
    id: 'ex-barbell-squat',
    name: 'Barbell Back Squat',
    category: 'Quads',
    defaultSets: 3,
    targetReps: '8-10',
    minReps: 8,
    maxReps: 10,
    restSeconds: 150,
    notes: 'Experiment with foot stance, squat down to at least parallel, elevate heels onto weight plates if needed.',
    pdfPage: 'Page 16',
    step1Setup: 'Set bar at mid-chest height. Grip bar slightly wider than shoulder-width, duck under bar onto upper traps. Take 3 steps back with stance just outside shoulder-width (toes 15 deg out).',
    step2Execution: 'Brace core, squat straight down bending hips and knees with bar tracking over midfoot until thighs hit parallel or lower.',
    step3Execution: 'Reverse movement by extending legs while driving bar straight up vertically.',
    additionalTips: 'Elevate heels on 5lb weight plates if ankle mobility limits parallel depth.',
    alternatives: ['Quad-Focused Leg Press (https://youtu.be/0nrW-q7-WRQ)', 'Smith Machine Squat (https://youtu.be/zSVi51Jp3eI)'],
  },
  {
    id: 'ex-db-rdl',
    name: 'Dumbbell Romanian Deadlift',
    category: 'Hamstrings',
    defaultSets: 3,
    targetReps: '8-10',
    minReps: 8,
    maxReps: 10,
    restSeconds: 120,
    notes: 'Hinge hips straight back, keep dumbbells close to legs, descend to knee or mid-shin level until hamstrings stretch.',
    pdfPage: 'Page 17',
    step1Setup: 'Hold dumbbells by sides with shoulder-width stance (toes 15 deg out).',
    step2Execution: 'Contract abs, push hips straight back with slight knee bend, dragging dumbbells close to thighs down to knee or shin level.',
    step3Execution: 'Drive hips forward to return to standing position, squeezing glutes.',
    additionalTips: 'Think about pulling the floor back with your heels to engage hamstrings.',
    alternatives: ['Barbell Romanian Deadlift (https://youtu.be/Q-2telZDPRw)', 'Hyperextensions (https://youtu.be/RU5d2H_OmSc)'],
  },
  {
    id: 'ex-leg-extension',
    name: 'Seated Leg Extensions',
    category: 'Quads',
    defaultSets: 3,
    targetReps: '10-15',
    minReps: 10,
    maxReps: 15,
    restSeconds: 90,
    notes: 'Align knees beside pivot point, extend legs fully, pause briefly at top contraction.',
    pdfPage: 'Page 18',
    step1Setup: 'Align knees beside machine pivot point with pad resting just above ankles (90 degree leg angle).',
    step2Execution: 'Pull up on side handles to anchor hips. Extend legs straight forward using quads.',
    step3Execution: 'Pause briefly at full extension at top before controlling weight back down.',
    additionalTips: 'Keep knees facing straight forward rather than rotating inward during extension.',
    alternatives: ['Sissy Squat (https://youtu.be/3SeCC8ABZ_Q)', 'Heel Elevated Goblet Squat (https://youtu.be/l9crMLuT4II)'],
  },
  {
    id: 'ex-walking-lunges',
    name: 'Walking Lunges (Quad-Focused)',
    category: 'Quads',
    defaultSets: 3,
    targetReps: '8-10',
    minReps: 8,
    maxReps: 10,
    restSeconds: 120,
    notes: 'Take steps forward, keep torso upright, drive knee forward towards toes.',
    pdfPage: 'Page 19',
    step1Setup: 'Stand upright holding dumbbells by sides. Brace core.',
    step2Execution: 'Step forward, sink into lunge driving front knee forward over toes until front thigh is parallel to floor.',
    step3Execution: 'Push through front heel to step feet together, then repeat on opposite leg.',
    additionalTips: 'Keep 80-90% weight in front working leg and use back leg only for balance.',
    alternatives: ['Heel Elevated Split Squat (https://youtu.be/bJE0-eZLa6E)', 'Bulgarian Split Squat (https://youtu.be/r9XtxWSTlcg)'],
  },
  {
    id: 'ex-standing-calf-raise',
    name: 'Standing Weighted Calf Raises',
    category: 'Calves',
    defaultSets: 3,
    targetReps: '10-15',
    minReps: 10,
    maxReps: 15,
    restSeconds: 90,
    notes: 'Feet hip width apart, elevate toes on weight plate for full stretch, press up on big toes.',
    pdfPage: 'Page 20',
    step1Setup: 'Stand hip-width apart holding dumbbells or barbell with toes elevated on weight plate.',
    step2Execution: 'Push straight up onto toes as far as possible, putting pressure on big toes.',
    step3Execution: 'Lower heels down under control for a 2-second stretch before next rep.',
    additionalTips: 'Place a weight plate under toes for extended range of motion stretch.',
    alternatives: ['Single Leg Weighted Calf Raise (https://youtu.be/cRKA_Qdut7I)', 'Leg Press Calf Raise (https://youtu.be/s8yUXsZrgE0)'],
  },

  // Push
  {
    id: 'ex-low-incline-db-press',
    name: 'Low Incline Dumbbell Press',
    category: 'Chest',
    defaultSets: 3,
    targetReps: '8-10',
    minReps: 8,
    maxReps: 10,
    restSeconds: 150,
    notes: 'Set bench 1-2 notches up from bottom (15-30 deg), keep chest up, avoid flaring elbows out.',
    pdfPage: 'Page 24',
    step1Setup: 'Set bench to 15-30 degrees (1st-2nd notch). Kick dumbbells into position straight over shoulders.',
    step2Execution: 'Lower weight with elbows at 45-60 degree angle until dumbbells reach chest level.',
    step3Execution: 'Press weight straight up and in, bringing arms together at top lockout.',
    additionalTips: 'Retract shoulder blades into bench to isolate upper chest.',
    alternatives: ['Incline Machine Chest Press (https://youtu.be/abc1fisYB3w)', 'Low Incline Smith Machine Press (https://youtu.be/R53nThQcdZo)'],
  },
  {
    id: 'ex-seated-mid-chest-fly',
    name: 'Seated Mid-Chest Cable Flyes',
    category: 'Chest',
    defaultSets: 3,
    targetReps: '10-15',
    minReps: 10,
    maxReps: 15,
    restSeconds: 90,
    notes: 'Set cables to chest height, squeeze arms together, pause at end peak position.',
    pdfPage: 'Page 25',
    step1Setup: 'Position bench in center of cable machine at 75 degree angle. Set cable height at mid-chest.',
    step2Execution: 'Bring handles together in front with elbows slightly bent, squeezing chest.',
    step3Execution: 'Pause at peak contraction, then slowly open arms until elbows reach torso level.',
    additionalTips: 'Squeeze biceps in as if bringing them together for maximal chest recruitment.',
    alternatives: ['Standing Mid-Chest Cable Fly (https://youtu.be/fyFVaCP9J-8)', 'Pec-Deck Machine Fly (https://youtu.be/rnV3y1P7894)'],
  },
  {
    id: 'ex-flat-db-press',
    name: 'Flat Dumbbell Press',
    category: 'Chest',
    defaultSets: 3,
    targetReps: '8-10',
    minReps: 8,
    maxReps: 10,
    restSeconds: 120,
    notes: 'Keep chest up, avoid flaring elbows out, control the weight up and down.',
    pdfPage: 'Page 26',
    step1Setup: 'Lay back on flat bench with dumbbells over shoulders and lower back slightly arched.',
    step2Execution: 'Lower dumbbells with elbows tucked at 45-60 degrees to torso level.',
    step3Execution: 'Press straight back up to full lockout over chest.',
    additionalTips: 'Plant feet firmly into ground for leg drive stability.',
    alternatives: ['Barbell Bench Press (https://youtu.be/pCGVSBk0bIQ)', 'Flat Machine Chest Press (https://youtu.be/sO8lFa9CidE)'],
  },
  {
    id: 'ex-db-lateral-raise',
    name: 'Dumbbell Lateral Raises',
    category: 'Shoulders',
    defaultSets: 3,
    targetReps: '15-20',
    minReps: 15,
    maxReps: 20,
    restSeconds: 90,
    notes: 'Lean torso forward slightly (15 deg), raise arms in scapular Y plane, avoid momentum.',
    pdfPage: 'Page 27',
    step1Setup: 'Stand shoulder-width apart holding dumbbells, leaning torso 15 degrees forward.',
    step2Execution: 'Raise dumbbells out in front in Y scapular plane (15-30 deg forward) to shoulder height.',
    step3Execution: 'Lower dumbbells under control down in front of thighs before next rep.',
    additionalTips: 'Use a thumbless grip and think about pushing hands out towards walls.',
    alternatives: ['Cable Lateral Raise (https://youtu.be/1muit9qEctY)', 'Lying Incline Lateral Raise (https://youtu.be/upEqeI0F73M)'],
  },
  {
    id: 'ex-incline-overhead-ext',
    name: 'Incline DB Overhead Extensions',
    category: 'Triceps',
    defaultSets: 3,
    targetReps: '10-15',
    minReps: 10,
    maxReps: 15,
    restSeconds: 90,
    notes: 'Set bench to 45 degrees, move arms parallel to torso, keep upper elbows locked overhead.',
    pdfPage: 'Page 28',
    step1Setup: 'Set bench to 45 degrees (2-3 notches). Lay back with arms overhead parallel to torso.',
    step2Execution: 'Keep upper elbows locked overhead and bend forearms back behind head as far as possible.',
    step3Execution: 'Extend forearms back to starting overhead position to lockout triceps.',
    additionalTips: 'Keep elbows fixed in space overhead to stretch the triceps long head.',
    alternatives: ['Overhead Rope Extensions (https://youtu.be/7yoTblFCUQM)', 'Cable Pushdowns (https://youtu.be/MlfCS_7ZLXA)'],
  },
  {
    id: 'ex-cable-pushdowns',
    name: 'Cable Pushdowns (Elbow Friendly)',
    category: 'Triceps',
    defaultSets: 2,
    targetReps: '10-15',
    minReps: 10,
    maxReps: 15,
    restSeconds: 90,
    notes: 'Use two rope attachments if possible, keep elbows locked to sides, push down and out.',
    pdfPage: 'Page 29',
    step1Setup: 'Set top pulley height. Use two rope attachments, stepping back with 30 deg forward torso lean.',
    step2Execution: 'Keep elbows locked at sides, extend forearms down and spread ropes apart at bottom.',
    step3Execution: 'Control hands back up to chest height while keeping elbows stationary.',
    additionalTips: 'Using two rope attachments allows longer full range of motion lockout.',
    alternatives: ['Incline DB Overhead Extensions (https://youtu.be/3d86xMhHROA)', 'Overhead Rope Extensions (https://youtu.be/7yoTblFCUQM)'],
  },

  // Pull
  {
    id: 'ex-pull-ups',
    name: '(Weighted) Pull-Ups',
    category: 'Back',
    defaultSets: 3,
    targetReps: '6-12',
    minReps: 6,
    maxReps: 12,
    restSeconds: 150,
    notes: 'Grip outside shoulder-width, pull until chin over bar, use alternative if unable to do 6 reps.',
    pdfPage: 'Page 33',
    step1Setup: 'Grip bar overhand wider than shoulder-width. Hang with feet together and core engaged.',
    step2Execution: 'Depress shoulders down, pull elbows into back pockets, bringing chest up to bar.',
    step3Execution: 'Lower body under control until arms are almost fully straightened.',
    additionalTips: 'Think about pulling elbows down into back pockets rather than pulling with hands.',
    alternatives: ['Lat Pulldown (https://youtu.be/AvYZZhEl7Xk)', '3 Point Dumbbell Row (https://youtu.be/hrBLmuQ_vq8)'],
  },
  {
    id: 'ex-lat-cable-row',
    name: 'Lat Focused Cable Row',
    category: 'Back',
    defaultSets: 3,
    targetReps: '10-12',
    minReps: 10,
    maxReps: 12,
    restSeconds: 120,
    notes: 'Lean torso forward slightly, pull elbows down and back, keep elbows tight to sides.',
    pdfPage: 'Page 34',
    step1Setup: 'Sit with knees slightly bent. Lean torso slightly forward over hips.',
    step2Execution: 'Pull elbows down and back towards back pockets, keeping elbows tucked close to sides.',
    step3Execution: 'Stop when elbows reach torso, control weight back until arms extend.',
    additionalTips: 'Keep elbows tucked to sides to maximize lower lat fiber recruitment.',
    alternatives: ['Chest Supported DB Row (https://youtu.be/I2Unz9FR0sc)', 'Barbell Row (lat focus) (https://youtu.be/tS5lKXxtNvE)'],
  },
  {
    id: 'ex-rear-delt-cable-row',
    name: 'Rear Delt Cable Row',
    category: 'Shoulders',
    defaultSets: 3,
    targetReps: '12-15',
    minReps: 12,
    maxReps: 15,
    restSeconds: 90,
    notes: 'Use wide handle outside shoulder-width, pull elbows at 45 degree angle as far back as possible.',
    pdfPage: 'Page 35',
    step1Setup: 'Use wide attachment with hands outside shoulder-width.',
    step2Execution: 'Pull handle towards sternum with elbows flared out at 45 degree angle.',
    step3Execution: 'Pull elbows back as far behind body as possible to squeeze rear delts.',
    additionalTips: 'Think about pulling with elbows rather than hands to target rear delts.',
    alternatives: ['Chest Supported DB Rear Delt Row (https://youtu.be/6LTUVaKpRCk)', 'Rear Delt Cable Fly (https://youtu.be/2Xepcd9FYvE)'],
  },
  {
    id: 'ex-incline-db-curls',
    name: 'Incline Dumbbell Curls',
    category: 'Biceps',
    defaultSets: 2,
    targetReps: '8-10',
    minReps: 8,
    maxReps: 10,
    restSeconds: 90,
    notes: 'Set bench 2-3 notches down from top (60 deg), alternate arms each rep, keep upper elbow locked.',
    pdfPage: 'Page 36',
    step1Setup: 'Set bench to 60 degrees. Lay back with arms hanging straight down with palms in.',
    step2Execution: 'Keep upper elbows locked back. Curl dumbbell up while supinating wrist to face ceiling at top.',
    step3Execution: 'Lower weight under control back to full arm extension before repeating.',
    additionalTips: 'Allowing arms to hang back stretches long head of biceps.',
    alternatives: ['Behind Body Cable Curls (https://youtu.be/S2CNDlAY8kY)', 'Barbell Curl (https://youtu.be/-ClfZ00zo8c)'],
  },
  {
    id: 'ex-hammer-curls',
    name: 'Hammer Curls',
    category: 'Biceps',
    defaultSets: 2,
    targetReps: '8-10',
    minReps: 8,
    maxReps: 10,
    restSeconds: 90,
    notes: 'Use neutral hammer grip, pull up and across chest, alternate arms each rep.',
    pdfPage: 'Page 37',
    step1Setup: 'Stand upright holding dumbbells in neutral grip with palms facing each other.',
    step2Execution: 'Curl one dumbbell up and slightly across chest keeping neutral grip.',
    step3Execution: 'Control weight down to full lockout before alternating to other arm.',
    additionalTips: 'Target brachialis and forearms by keeping neutral grip throughout.',
    alternatives: ['Rope Cable Curls (neutral grip) (https://youtu.be/0vEzBCydrU0)'],
  },
  {
    id: 'ex-face-pulls',
    name: 'Standing Face Pulls',
    category: 'Shoulders',
    defaultSets: 2,
    targetReps: '10',
    minReps: 10,
    maxReps: 12,
    restSeconds: 60,
    notes: 'Use double rope attachment at top pulley, light weight, pull to forehead with 90 deg elbow bend then Y-raise.',
    pdfPage: 'Page 38',
    step1Setup: 'Set top pulley with double rope attachment. Stand back with arms straight.',
    step2Execution: 'Pull rope handles toward forehead while pulling elbows back to 90 degree biceps flex pose.',
    step3Execution: 'Raise arms into Y position overhead before returning to start.',
    additionalTips: 'Keep weight light and focus on external shoulder rotation at end of pull.',
    alternatives: ['Bent Over Dumbbell Face Pulls (https://youtu.be/kA415Unr-_E)', 'Wall Slides (https://youtu.be/x4zjfuLXHVk)'],
  },

  // Lower Body 2
  {
    id: 'ex-barbell-deadlift',
    name: 'Barbell Deadlift',
    category: 'Hamstrings',
    defaultSets: 3,
    targetReps: '6-8',
    minReps: 6,
    maxReps: 8,
    restSeconds: 150,
    notes: 'Hip-width stance, grip outside knees, keep head/back/hips in straight line, wedge into bar.',
    pdfPage: 'Page 42',
    step1Setup: 'Stand under bar over midfoot with feet hip-width apart. Hinge hips back, grip bar shoulder-width just outside knees. Bring bar to shins.',
    step2Execution: 'Engage lats to wedge into bar, brace core, push feet away from floor keeping bar close to legs.',
    step3Execution: 'Drive hips forward at top to squeeze glutes into full lockout.',
    additionalTips: 'If back rounds, elevate starting bar height onto weight plates.',
    alternatives: ['Sumo Deadlift (https://youtu.be/9rXKd-_DaRs)', 'Trap Bar Deadlift (https://youtu.be/5mnlJtf-7WM)'],
  },
  {
    id: 'ex-bulgarian-split-squat',
    name: 'Bulgarian Split Squat (Glute Focused)',
    category: 'Glutes',
    defaultSets: 3,
    targetReps: '8-10',
    minReps: 8,
    maxReps: 10,
    restSeconds: 60,
    notes: 'Use wider foot stance, lean torso forward slightly over front leg to emphasize glutes.',
    pdfPage: 'Page 43',
    step1Setup: 'Elevate rear foot on bench. Take wider stance and lean torso slightly forward.',
    step2Execution: 'Squat down driving back knee toward ground until front thigh is parallel to floor.',
    step3Execution: 'Push through front heel to drive hips up back to start.',
    additionalTips: 'Keep 80-90% weight in front working leg and rest 1 minute between legs.',
    alternatives: ['Front Foot Elevated Reverse Lunges (https://youtu.be/JySEdVXPUM8)', 'Weighted Step-Ups (https://youtu.be/Cjc3AgmdtlA)'],
  },
  {
    id: 'ex-hip-thrust',
    name: 'Barbell Hip Thrust',
    category: 'Glutes',
    defaultSets: 3,
    targetReps: '10-15',
    minReps: 10,
    maxReps: 15,
    restSeconds: 120,
    notes: 'Squeeze glutes hard, knees 90 degrees at top position, chin tucked down.',
    pdfPage: 'Page 44',
    step1Setup: 'Lay with upper back against bench and barbell padded over hips. Feet shoulder-width apart (90 deg knee angle at top).',
    step2Execution: 'Tuck chin down, squeeze glutes and drive through heels to push hips up vertically.',
    step3Execution: 'Pause for 1-2 seconds at top lockout before controlling weight back halfway down.',
    additionalTips: 'Keep chin tucked down throughout movement to prevent lower back arching.',
    alternatives: ['Smith Machine Hip Thrust (https://youtu.be/srYETmyq3_c)', 'Single Leg Hip Thrusts (https://youtu.be/FKD9-qezw08)'],
  },
  {
    id: 'ex-lying-leg-curls',
    name: 'Lying Leg Curls',
    category: 'Hamstrings',
    defaultSets: 3,
    targetReps: '10-15',
    minReps: 10,
    maxReps: 15,
    restSeconds: 90,
    notes: 'Pull down on handles, avoid over-arching lower back, control weight up and down.',
    pdfPage: 'Page 45',
    step1Setup: 'Set pad above heel. Position knees beside pivot point with thighs on pad.',
    step2Execution: 'Pull down on handles, curl pad up toward glutes as far as possible.',
    step3Execution: 'Control weight back down until legs almost fully extend before next rep.',
    additionalTips: 'Avoid fully extending legs at bottom to keep constant hamstring tension.',
    alternatives: ['Seated Leg Curls (https://youtu.be/81umRgyxIAU)', 'Swiss Ball Leg Curls (https://youtu.be/uRBpd65dbYs)'],
  },
  {
    id: 'ex-seated-calf-raise',
    name: 'Seated Weighted Calf Raises',
    category: 'Calves',
    defaultSets: 3,
    targetReps: '10-15',
    minReps: 10,
    maxReps: 15,
    restSeconds: 90,
    notes: 'Point toes forward, lower heels as far as possible for stretch, press up on big toes.',
    pdfPage: 'Page 46',
    step1Setup: 'Sit on bench with toes on weight plate (90 deg knee angle) and dumbbells on thighs.',
    step2Execution: 'Push straight up onto toes as far as possible with pressure on big toe.',
    step3Execution: 'Slowly lower heels down to bottom stretch before repeating.',
    additionalTips: 'Seated calf raises specifically target the soleus muscle.',
    alternatives: ['Seated Bodyweight Calf Raise (https://youtu.be/jW-cNnwRJ7E)'],
  },
];

const FALLBACK_ROUTINES: Routine[] = [
  {
    id: 'routine-upper-body',
    title: 'Upper Body Workout',
    focus: 'Upper Body (Chest, Back, Shoulders)',
    description: '6 Exercises • High volume BWS Upper Body workout targeting total upper body hypertrophy.',
    exerciseIds: [
      'ex-bench-press',
      'ex-db-chest-row',
      'ex-ohp',
      'ex-lat-pulldown',
      'ex-high-low-cable-fly',
      'ex-cable-lateral-raise',
    ],
  },
  {
    id: 'routine-lower-body-1',
    title: 'Lower Body 1 (Quad-Focused)',
    focus: 'Quads, Calves & Hamstrings',
    description: '5 Exercises • Primary BWS lower body routine emphasizing Quad strength and hypertrophy.',
    exerciseIds: [
      'ex-barbell-squat',
      'ex-db-rdl',
      'ex-leg-extension',
      'ex-walking-lunges',
      'ex-standing-calf-raise',
    ],
  },
  {
    id: 'routine-push',
    title: 'Push Workout',
    focus: 'Chest, Shoulders & Triceps',
    description: '6 Exercises • Targeted pressing workout for upper body pushes, front/side delts and triceps extension.',
    exerciseIds: [
      'ex-low-incline-db-press',
      'ex-seated-mid-chest-fly',
      'ex-flat-db-press',
      'ex-db-lateral-raise',
      'ex-incline-overhead-ext',
      'ex-cable-pushdowns',
    ],
  },
  {
    id: 'routine-pull',
    title: 'Pull Workout',
    focus: 'Back, Rear Delts & Biceps',
    description: '6 Exercises • Comprehensive pulling session for vertical/horizontal lat back volume, biceps and rear deltoids.',
    exerciseIds: [
      'ex-pull-ups',
      'ex-lat-cable-row',
      'ex-rear-delt-cable-row',
      'ex-incline-db-curls',
      'ex-hammer-curls',
      'ex-face-pulls',
    ],
  },
  {
    id: 'routine-lower-body-2',
    title: 'Lower Body 2 (Glute-Focused)',
    focus: 'Glutes, Hamstrings & Calves',
    description: '5 Exercises • Secondary BWS lower body session emphasizing posterior chain, glute hypertrophy and calves.',
    exerciseIds: [
      'ex-barbell-deadlift',
      'ex-bulgarian-split-squat',
      'ex-hip-thrust',
      'ex-lying-leg-curls',
      'ex-seated-calf-raise',
    ],
  },
];

function deduplicateWorkouts(logs: WorkoutLog[]): WorkoutLog[] {
  const seenKeys = new Set<string>();
  const clean: WorkoutLog[] = [];

  logs.forEach((log) => {
    if (!log || (log as any).deleted) return;
    const dateKey = log.date ? new Date(log.date).toISOString().substring(0, 10) : '';
    const uniqueKey = log.id || `${dateKey}-${log.routineTitle}`;

    if (!seenKeys.has(uniqueKey)) {
      seenKeys.add(uniqueKey);
      clean.push(log);
    }
  });

  return clean.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function getStoredWorkouts(): WorkoutLog[] {

  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_WORKOUTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredWorkouts(logs: WorkoutLog[]) {
  try {
    localStorage.setItem(LOCAL_STORAGE_WORKOUTS_KEY, JSON.stringify(logs));
  } catch (e) {
    console.warn('LocalStorage save note:', e);
  }
}

export const api = {
  // Routines
  getRoutines: async (): Promise<Routine[]> => {
    try {
      const res = await axios.get(`${API_BASE}/routines`);
      if (Array.isArray(res.data) && res.data.length > 0 && res.data.every((r) => r.exercises && r.exercises.length >= 5)) {
        return res.data;
      }
    } catch (e) {
      // Fallback
    }

    return FALLBACK_ROUTINES.map((r) => ({
      ...r,
      exercises: r.exerciseIds
        .map((id) => FALLBACK_EXERCISES.find((ex) => ex.id === id))
        .filter(Boolean) as Exercise[],
    }));
  },

  getRoutineById: async (id: string): Promise<Routine> => {
    // Synchronous instant local routine lookup for 0ms load speed
    const found = FALLBACK_ROUTINES.find((r) => r.id === id) || FALLBACK_ROUTINES[0];
    const exercises = found.exerciseIds
      .map((exId) => FALLBACK_EXERCISES.find((ex) => ex.id === exId))
      .filter(Boolean) as Exercise[];

    const fallbackRoutine: Routine = {
      ...found,
      id: id || found.id,
      exercises,
    };

    // Quick background check with strict 800ms timeout
    try {
      const res = await axios.get(`${API_BASE}/routines/${id}`, { timeout: 800 });
      if (res.data && res.data.id && Array.isArray(res.data.exercises) && res.data.exercises.length >= 5) {
        return res.data;
      }
    } catch (e) {
      // Use instant fallback
    }

    return fallbackRoutine;
  },

  // Exercises
  getExercises: async (category?: string, search?: string): Promise<Exercise[]> => {
    try {
      const res = await axios.get(`${API_BASE}/exercises`, { params: { category, search }, timeout: 800 });
      if (Array.isArray(res.data) && res.data.length > 0) return res.data;
    } catch (e) {
      // Fallback
    }
    return FALLBACK_EXERCISES.filter((ex) => {
      const matchesCategory = !category || category === 'All' || ex.category.toLowerCase() === category.toLowerCase();
      const matchesSearch = !search || ex.name.toLowerCase().includes(search.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  },

  getExerciseById: async (id: string): Promise<Exercise> => {
    try {
      const res = await axios.get(`${API_BASE}/exercises/${id}`, { timeout: 800 });
      if (res.data && res.data.id) return res.data;
    } catch (e) {
      // Fallback
    }
    return FALLBACK_EXERCISES.find((e) => e.id === id) || FALLBACK_EXERCISES[0];
  },

  getExerciseHistory: async (id: string): Promise<ExerciseHistoryResponse> => {
    try {
      const res = await axios.get(`${API_BASE}/exercises/${id}/history`, { timeout: 800 });
      if (res.data && Array.isArray(res.data.history) && res.data.history.length > 0) return res.data;
    } catch (e) {
      // Fallback
    }

    const workouts = await api.getWorkouts();
    let maxWeightKg = 0;
    let maxEstimated1RM = 0;

    const historyTrend: ExerciseHistoryPoint[] = [];

    const sortedWorkouts = [...workouts].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    sortedWorkouts.forEach((wLog) => {
      const exLog = wLog.exerciseLogs?.find((e) => e.exerciseId === id);
      if (!exLog) return;

      let maxW = 0;
      let maxR = 0;
      let est1RM = 0;
      const completedSets = exLog.sets ? exLog.sets.filter((s) => s.completed) : [];

      completedSets.forEach((set) => {
        const weight = set.weightKg || 0;
        const reps = set.reps || 0;
        if (weight > maxW) maxW = weight;
        if (reps > maxR) maxR = reps;
        if (weight > maxWeightKg) maxWeightKg = weight;

        const setEst = reps > 0 ? weight * (1 + reps / 30) : weight;
        if (setEst > est1RM) est1RM = setEst;
        if (setEst > maxEstimated1RM) maxEstimated1RM = Math.round(setEst * 10) / 10;
      });

      if (completedSets.length > 0) {
        historyTrend.push({
          date: wLog.date,
          routineTitle: wLog.routineTitle,
          maxWeightKg: maxW,
          maxReps: maxR,
          estimated1RM: Math.round(est1RM * 10) / 10,
          setsCount: completedSets.length,
        });
      }
    });

    return {
      exerciseId: id,
      maxWeightKg,
      maxEstimated1RM,
      history: historyTrend,
    };
  },

  // Central Database User ID Resolver
  getCentralUserId: (userId?: string): string => {
    if (userId) return userId;
    if (auth.currentUser?.uid) return auth.currentUser.uid;
    let deviceUid = localStorage.getItem('bws_central_user_id');
    if (!deviceUid) {
      deviceUid = `central-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      localStorage.setItem('bws_central_user_id', deviceUid);
    }
    return deviceUid;
  },

  // Central Database Workouts API (Instant 0ms Load + Non-Blocking Cloud Sync)
  getWorkouts: async (userId?: string): Promise<WorkoutLog[]> => {
    const uid = api.getCentralUserId(userId);
    const KEY = `bws_gym_tracker_workouts_${uid}`;
    let localLogs: WorkoutLog[] = [];

    try {
      const raw = localStorage.getItem(KEY);
      if (raw) localLogs = deduplicateWorkouts(JSON.parse(raw));
      else localLogs = deduplicateWorkouts(getStoredWorkouts());
    } catch (e) {
      localLogs = deduplicateWorkouts(getStoredWorkouts());
    }

    // Asynchronous non-blocking Cloud Firestore background sync
    setTimeout(async () => {
      try {
        const q = query(collection(db, 'users', uid, 'workouts'), orderBy('date', 'desc'));
        const snap = await getDocs(q);
        if (!snap.empty) {
          const remoteLogs: WorkoutLog[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            if (data && !data.deleted) {
              remoteLogs.push(data as WorkoutLog);
            }
          });

          const deduplicated = deduplicateWorkouts(remoteLogs);
          localStorage.setItem(KEY, JSON.stringify(deduplicated));
          saveStoredWorkouts(deduplicated);
        }
      } catch (e) {
        console.warn('Central database background sync note:', e);
      }
    }, 0);

    return localLogs;
  },


  logWorkout: async (workout: Omit<WorkoutLog, 'id'>, userId?: string): Promise<WorkoutLog> => {
    const uid = api.getCentralUserId(userId);
    const KEY = `bws_gym_tracker_workouts_${uid}`;

    const newLog: WorkoutLog = {
      ...workout,
      id: `wlog-${Date.now()}`,
    };

    // 1. Instant 0ms local storage update
    let existing: WorkoutLog[] = [];
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) existing = JSON.parse(raw);
      else existing = getStoredWorkouts();
    } catch (e) {}

    const updated = [newLog, ...existing.filter((w) => w.id !== newLog.id)];
    try {
      localStorage.setItem(KEY, JSON.stringify(updated));
      saveStoredWorkouts(updated);
    } catch (e) {}

    // 2. Non-blocking background sync to Firebase Cloud Firestore & optional API
    setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', uid, 'workouts', newLog.id);
        await setDoc(docRef, newLog);
      } catch (e) {
        console.warn('Background Firestore workout write note:', e);
      }

      try {
        await axios.post(`${API_BASE}/workouts`, newLog, { timeout: 1500 });
      } catch (e) {}
    }, 0);

    return newLog;
  },


  saveWorkout: async (workout: Omit<WorkoutLog, 'id'>, userId?: string): Promise<WorkoutLog> => {
    return api.logWorkout(workout, userId);
  },

  deleteWorkout: async (workoutId: string, userId?: string): Promise<void> => {
    const uid = api.getCentralUserId(userId);
    const KEY = `bws_gym_tracker_workouts_${uid}`;

    // Delete from Central Firebase Database
    try {
      const docRef = doc(db, 'users', uid, 'workouts', workoutId);
      await setDoc(docRef, { deleted: true }, { merge: true });
    } catch (e) {}

    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const existing: WorkoutLog[] = JSON.parse(raw);
        const updated = existing.filter((w) => w.id !== workoutId);
        localStorage.setItem(KEY, JSON.stringify(updated));
        saveStoredWorkouts(updated);
      }
    } catch (e) {}
  },


  clearAllWorkouts: async (userId?: string): Promise<void> => {
    const uid = api.getCentralUserId(userId);
    const KEY = `bws_gym_tracker_workouts_${uid}`;
    localStorage.removeItem(KEY);
    localStorage.removeItem(LOCAL_STORAGE_WORKOUTS_KEY);
    saveStoredWorkouts([]);

    // Mark all remote workouts as deleted in Cloud Firestore so they do not auto-sync back
    try {
      const q = query(collection(db, 'users', uid, 'workouts'));
      const snap = await getDocs(q);
      const deletePromises = snap.docs.map((docSnap) =>
        setDoc(doc(db, 'users', uid, 'workouts', docSnap.id), { deleted: true }, { merge: true })
      );
      await Promise.all(deletePromises);
    } catch (e) {
      console.warn('Firestore clear error:', e);
    }
  },

  restoreAllWorkouts: async (userId?: string): Promise<void> => {
    const uid = api.getCentralUserId(userId);
    try {
      const q = query(collection(db, 'users', uid, 'workouts'));
      const snap = await getDocs(q);
      const restorePromises = snap.docs.map((docSnap) =>
        setDoc(doc(db, 'users', uid, 'workouts', docSnap.id), { deleted: false }, { merge: true })
      );
      await Promise.all(restorePromises);
    } catch (e) {
      console.warn('Firestore restore error:', e);
    }
  },

  syncSetToDatabase: async (routineId: string, logs: LiveExerciseLog[], userId?: string): Promise<void> => {
    const uid = api.getCentralUserId(userId);
    const payload = prepareActiveDraftPayload(routineId, logs);

    try {
      localStorage.setItem(`bws_active_draft_${uid}_${routineId}`, JSON.stringify(payload));
    } catch (e) {}

    // Non-blocking real-time push to Google Cloud Firestore active_drafts
    setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', uid, 'active_drafts', routineId);
        await setDoc(docRef, payload, { merge: true });
      } catch (e) {
        console.warn('Realtime set cloud sync note:', e);
      }
    }, 0);
  },

  clearActiveDraft: async (routineId: string, userId?: string): Promise<void> => {
    const uid = api.getCentralUserId(userId);
    try {
      localStorage.removeItem(`bws_active_draft_${uid}_${routineId}`);
      const docRef = doc(db, 'users', uid, 'active_drafts', routineId);
      await setDoc(docRef, { deleted: true }, { merge: true });
    } catch (e) {}
  },





  // Volume Matrix (0 sets by default, dynamically populated from last 7 days of logged workouts)
  getVolumeMatrix: async (userId?: string): Promise<VolumeMatrixEntry[]> => {
    const workouts = await api.getWorkouts(userId);
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Filter workouts from last 7 days
    const recentWorkouts = workouts.filter((w) => new Date(w.date) >= sevenDaysAgo);

    const categories = ['Chest', 'Back', 'Shoulders', 'Quads', 'Hamstrings', 'Glutes', 'Biceps', 'Triceps', 'Calves'];
    const categoryCounts: Record<string, number> = {};
    categories.forEach((cat) => (categoryCounts[cat] = 0));

    recentWorkouts.forEach((w) => {
      w.exerciseLogs?.forEach((ex) => {
        const exMeta = FALLBACK_EXERCISES.find((e) => e.id === ex.exerciseId || e.name === ex.exerciseName);
        const cat = exMeta?.category || 'Chest';

        const completedCount = ex.sets?.filter((s) => s.completed)?.length || 0;
        if (categoryCounts[cat] !== undefined) {
          categoryCounts[cat] += completedCount;
        }
      });
    });

    return categories.map((cat) => {
      const completedSets = categoryCounts[cat] || 0;
      const targetSets = 14;
      const percentage = Math.min(100, Math.round((completedSets / targetSets) * 100));
      let status: 'Low' | 'Optimal' | 'High' = 'Low';
      if (completedSets >= 14) status = 'Optimal';
      else if (completedSets >= 8) status = 'High';

      return {
        category: cat,
        completedSets,
        targetSets,
        percentage,
        status,
      };
    });
  },


  // Analytics Summary
  getAnalyticsSummary: async (): Promise<AnalyticsSummary> => {
    try {
      const res = await axios.get(`${API_BASE}/analytics/summary`);
      if (res.data && res.data.totalVolumeKg !== undefined) return res.data;
    } catch (e) {
      // Fallback
    }

    const workouts = getStoredWorkouts();
    const totalWorkouts = workouts.length;
    let totalVolumeKg = 0;
    let totalPRs = 0;

    workouts.forEach((w) => {
      if (w.totalVolumeKg) totalVolumeKg += w.totalVolumeKg;
      if (w.prCount) totalPRs += w.prCount;
    });

    return {
      totalWorkouts,
      totalVolumeKg,
      totalPRs,
      recentWorkouts: workouts.slice(0, 5).map((w) => ({
        id: w.id,
        routineTitle: w.routineTitle,
        date: w.date,
        durationMinutes: w.durationMinutes,
        totalVolumeKg: w.totalVolumeKg,
        prCount: w.prCount,
      })),
    };
  },


  // User Profile
  getUserProfile: async (userId?: string): Promise<UserProfile> => {
    const uid = userId || auth.currentUser?.uid || localStorage.getItem('bws_device_user_id') || 'main_user';
    const PROFILE_KEY = `bws_user_profile_${uid}`;

    let localProfile: UserProfile = {
      id: uid,
      name: auth.currentUser?.displayName || '',
      currentWeightKg: 75.0,
      targetWeightKg: 70.0,
      heightCm: 175,
      bodyFatPercentage: 15.0,
      fitnessGoal: 'Hypertrophy',
      isProfileSetupCompleted: false,
      updatedAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) localProfile = JSON.parse(raw);
    } catch (e) {}

    // Firestore background sync
    setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', uid, 'profile', 'main');
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const remoteData = snap.data() as UserProfile;
          localStorage.setItem(PROFILE_KEY, JSON.stringify(remoteData));
        }
      } catch (e) {
        console.warn('Firestore profile sync note:', e);
      }
    }, 0);

    return localProfile;
  },

  saveUserProfile: async (profileUpdate: Partial<UserProfile>, userId?: string): Promise<UserProfile> => {
    const uid = userId || auth.currentUser?.uid || localStorage.getItem('bws_device_user_id') || 'main_user';
    const PROFILE_KEY = `bws_user_profile_${uid}`;

    let currentProfile: UserProfile = {
      id: uid,
      name: auth.currentUser?.displayName || '',
      currentWeightKg: 75.0,
      targetWeightKg: 70.0,
      heightCm: 175,
      bodyFatPercentage: 15.0,
      fitnessGoal: 'Hypertrophy',
      isProfileSetupCompleted: false,
      updatedAt: new Date().toISOString(),
    };

    try {
      const raw = localStorage.getItem(PROFILE_KEY);
      if (raw) {
        currentProfile = JSON.parse(raw);
      }
    } catch (e) {}

    const updatedProfile: UserProfile = {
      ...currentProfile,
      ...profileUpdate,
      id: uid,
      isProfileSetupCompleted: true,
      updatedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(PROFILE_KEY, JSON.stringify(updatedProfile));
    } catch (e) {}

    setTimeout(async () => {
      try {
        const docRef = doc(db, 'users', uid, 'profile', 'main');
        await setDoc(docRef, updatedProfile, { merge: true });
      } catch (e) {
        console.warn('Firestore profile save note:', e);
      }
    }, 0);

    return updatedProfile;
  },

  // PR Hall of Fame
  getPRHallOfFame: async (): Promise<import('../types').PRHallOfFameEntry[]> => {
    const workouts = getStoredWorkouts();
    const prMap: Record<string, import('../types').PRHallOfFameEntry> = {};

    workouts.forEach((w) => {
      w.exerciseLogs?.forEach((ex) => {
        const exMeta = FALLBACK_EXERCISES.find((e) => e.id === ex.exerciseId || e.name === ex.exerciseName);
        const name = ex.exerciseName || exMeta?.name || 'Exercise';
        const category = (ex as any).category || exMeta?.category || 'Chest';
        const key = ex.exerciseId || name;


        ex.sets?.forEach((s) => {
          if (s.completed && s.weightKg > 0) {
            const e1rm = Math.round(s.weightKg * (1 + (s.reps || 1) / 30));
            const existingMaxW = prMap[key]?.maxWeightKg || 0;
            const existing1RM = prMap[key]?.estimated1RM || 0;

            if (!prMap[key] || s.weightKg > existingMaxW || e1rm > existing1RM) {
              prMap[key] = {
                exerciseId: key,
                exerciseName: name,
                category,
                maxWeightKg: Math.max(s.weightKg, existingMaxW),
                maxReps: s.reps,
                estimated1RM: Math.max(e1rm, existing1RM),
                dateAchieved: w.date,
              };
            }
          }
        });
      });
    });

    return Object.values(prMap).sort((a, b) => b.estimated1RM - a.estimated1RM);
  },

  // Progressive Overload Deltas (Comparing latest session vs previous session per exercise)
  getProgressiveOverloadDeltas: async (): Promise<import('../types').OverloadDeltaEntry[]> => {
    const workouts = getStoredWorkouts();
    const exerciseHistoryMap: Record<string, { date: string; maxWeightKg: number; maxReps: number; estimated1RM: number; category: string; name: string }[]> = {};

    workouts.forEach((w) => {
      w.exerciseLogs?.forEach((ex) => {
        const exMeta = FALLBACK_EXERCISES.find((e) => e.id === ex.exerciseId || e.name === ex.exerciseName);
        const name = ex.exerciseName || exMeta?.name || 'Exercise';
        const category = (ex as any).category || exMeta?.category || 'Chest';
        const key = ex.exerciseId || name;


        let maxW = 0;
        let maxR = 0;
        let max1RM = 0;

        ex.sets?.forEach((s) => {
          if (s.completed && s.weightKg > 0) {
            if (s.weightKg > maxW) maxW = s.weightKg;
            if (s.reps > maxR) maxR = s.reps;
            const e1rm = Math.round(s.weightKg * (1 + s.reps / 30));
            if (e1rm > max1RM) max1RM = e1rm;
          }
        });

        if (maxW > 0) {
          if (!exerciseHistoryMap[key]) exerciseHistoryMap[key] = [];
          exerciseHistoryMap[key].push({
            date: w.date,
            maxWeightKg: maxW,
            maxReps: maxR,
            estimated1RM: max1RM,
            category,
            name,
          });
        }
      });
    });

    const deltas: import('../types').OverloadDeltaEntry[] = [];

    Object.keys(exerciseHistoryMap).forEach((key) => {
      const history = exerciseHistoryMap[key].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      if (history.length > 0) {
        const latest = history[history.length - 1];
        const previous = history.length > 1 ? history[history.length - 2] : latest;

        const wDelta = latest.maxWeightKg - previous.maxWeightKg;
        const rDelta = latest.maxReps - previous.maxReps;
        const e1rmDelta = latest.estimated1RM - previous.estimated1RM;

        let status: 'PR' | 'Gain' | 'Maintained' | 'Lower' = 'Maintained';
        if (e1rmDelta > 0 || wDelta > 0) status = 'Gain';
        if (e1rmDelta < 0 && wDelta < 0) status = 'Lower';

        deltas.push({
          exerciseId: key,
          exerciseName: latest.name,
          category: latest.category,
          latestWeightKg: latest.maxWeightKg,
          previousWeightKg: previous.maxWeightKg,
          weightDeltaKg: wDelta,
          latestReps: latest.maxReps,
          previousReps: previous.maxReps,
          repsDelta: rDelta,
          latest1RM: latest.estimated1RM,
          previous1RM: previous.estimated1RM,
          oneRMDeltaKg: e1rmDelta,
          status,
        });
      }
    });

    return deltas.sort((a, b) => b.latest1RM - a.latest1RM);
  },
};


export default api;
