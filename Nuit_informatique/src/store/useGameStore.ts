import { create } from 'zustand';
import { GAME_CONFIG } from '../config/gameConfig';

export type ComputerStatus = 'working' | 'broken' | 'infected' | 'destroyed';
export type OS = 'windows' | 'linux';
export type Software = 'office' | 'libreoffice';
export type GamePhase = 'start' | 'planning' | 'executing' | 'event';
export type ActionType = 'repair' | 'linux' | 'replace' | 'linux_fix';

export interface Computer {
    id: string;
    classroomId: number;
    status: ComputerStatus;
    os: OS;
    software: Software;
    pendingAction: ActionType | null;
    installationTurn: number;
}

export interface GameEvent {
    id: string;
    type: 'crash' | 'virus_attack';
    computerId: string;
    message: string;
    resolved: boolean;
}

export interface TurnSummary {
    income: number;
    expenses: number;
    happinessChange: number;
    newEvents: number;
    resolvedEvents: number;
    // Détail des dépenses
    officeLicenseCost: number;
    dataCost: number;
    trainingCost: number;
    migrationCost: number;
    partyCost: number;
    serverCost: number;
    maintenanceCost: number; // Réparations + Remplacements
    infectedCount: number;
    warning?: string;
    specialEvent?: string;
}

interface GameState {
    budget: number;
    ecology: number;
    happiness: number;
    dependency: number;
    turn: number;
    maxTurns: number;
    phase: GamePhase;
    computers: Computer[];
    events: GameEvent[];
    isCentreOpen: boolean;
    activeMiniGame: { type: 'laser', eventId: string } | null;

    // Advanced State
    lastTrainingTurn: number | null;
    pendingTraining: boolean;
    pendingMigrations: number[]; // Classroom IDs
    partyPlanned: boolean;
    pendingLocalServer: boolean;
    localServerCount: number;
    gameOver: boolean;
    gameOverReason: string | null;
    discoActive: boolean;
    maintenanceActionsUsed: number;
    specialActionsUsed: number;

    // Turn Summary
    turnSummary: TurnSummary | null;
    showTurnSummary: boolean;

    // Actions
    startGame: () => void;
    restartGame: () => void;
    startExecution: () => void;
    applyTurn: () => void;
    triggerEvents: () => number;
    planAction: (eventId: string, action: ActionType) => void;
    toggleCentre: (isOpen?: boolean) => void;
    resolveMiniGame: (success: boolean) => void;
    openLaserGame: (eventId?: string) => void;
    replaceComputer: (id: string) => void;
    closeTurnSummary: () => void;

    // Advanced Actions
    planTraining: () => void;
    planMigration: (classroomId: number) => void;
    toggleLinux: (computerId: string) => void;
    planParty: () => void;
    installLocalServer: () => void;
    reduceBudget: (amount: number) => void;
    stopDisco: () => void;
    unlockedClassrooms: number[];
    unlockClassroom: (classroomId: number) => void;
}

export const useGameStore = create<GameState>((set, get) => ({
    budget: GAME_CONFIG.INITIAL_BUDGET,
    ecology: 50,
    happiness: GAME_CONFIG.MAX_HAPPINESS,
    dependency: GAME_CONFIG.MAX_DEPENDENCY,
    turn: 0,
    maxTurns: GAME_CONFIG.MAX_TURNS,
    phase: 'start',
    computers: [],
    events: [],
    isCentreOpen: false,
    activeMiniGame: null,

    lastTrainingTurn: null,
    pendingTraining: false,
    pendingMigrations: [],
    partyPlanned: false,
    pendingLocalServer: false,
    localServerCount: 0,
    gameOver: false,
    gameOverReason: null,
    discoActive: false,
    unlockedClassrooms: [1, 2],
    maintenanceActionsUsed: 0,
    specialActionsUsed: 0,

    turnSummary: null,
    showTurnSummary: false,

    startGame: () => {
        const computers: Computer[] = [];
        let idCounter = 1;
        for (let i = 1; i <= 2; i++) {
            for (let j = 0; j < 10; j++) {
                computers.push({
                    id: `pc-${idCounter++}`,
                    classroomId: i,
                    status: 'working',
                    os: 'windows',
                    software: 'office',
                    pendingAction: null,
                    installationTurn: 0
                });
            }
        }
        set({
            computers,
            budget: GAME_CONFIG.INITIAL_BUDGET,
            happiness: GAME_CONFIG.MAX_HAPPINESS,
            dependency: GAME_CONFIG.MAX_DEPENDENCY,
            turn: 0,
            phase: 'planning',
            events: [],
            isCentreOpen: false,
            lastTrainingTurn: null,
            pendingTraining: false,
            pendingMigrations: [],
            partyPlanned: false,
            pendingLocalServer: false,
            localServerCount: 0,
            gameOver: false,
            gameOverReason: null,
            discoActive: false,
            maintenanceActionsUsed: 0,
            specialActionsUsed: 0,
            turnSummary: null,
            showTurnSummary: false,
            activeMiniGame: null
        });
    },

    restartGame: () => {
        get().startGame();
    },

    toggleCentre: (isOpen) => set((state) => ({
        isCentreOpen: isOpen !== undefined ? isOpen : !state.isCentreOpen
    })),

    closeTurnSummary: () => set({ showTurnSummary: false }),

    triggerEvents: () => {
        const { computers, turn } = get();
        const newEvents: GameEvent[] = [];

        // Filter Windows PCs that are working AND not immune
        const windowsPcs = computers.filter(c =>
            c.os === 'windows' &&
            c.status === 'working' &&
            (turn - c.installationTurn >= GAME_CONFIG.IMMUNITY_DURATION)
        );

        if (windowsPcs.length > 0) {
            // Virus attack chance (from laser-game branch)
            if (Math.random() < GAME_CONFIG.VIRUS_PROBABILITY) {
                const randomIndex = Math.floor(Math.random() * windowsPcs.length);
                const pc = windowsPcs[randomIndex];
                windowsPcs.splice(randomIndex, 1);

                newEvents.push({
                    id: `evt-${Date.now()}-virus`,
                    type: 'virus_attack',
                    computerId: pc.id,
                    message: `ALERTE VIRUS: PC ${pc.id} infecté !`,
                    resolved: false
                });
            }

            // Standard crash chance (from main branch logic)
            if (Math.random() < GAME_CONFIG.CRASH_PROBABILITY) {
                const numCrashes = Math.floor(Math.random() * (GAME_CONFIG.MAX_CRASHES_PER_TURN - GAME_CONFIG.MIN_CRASHES_PER_TURN + 1)) + GAME_CONFIG.MIN_CRASHES_PER_TURN;

                for (let i = 0; i < numCrashes; i++) {
                    if (windowsPcs.length === 0) break;
                    const randomIndex = Math.floor(Math.random() * windowsPcs.length);
                    const pc = windowsPcs[randomIndex];
                    windowsPcs.splice(randomIndex, 1);

                    newEvents.push({
                        id: `evt-${Date.now()}-${i}`,
                        type: 'crash',
                        computerId: pc.id,
                        message: `PC ${pc.id} (Windows) a cessé de fonctionner !`,
                        resolved: false
                    });
                }
            }
        }

        if (newEvents.length > 0) {
            const updatedComputers = computers.map(c => {
                if (newEvents.find(e => e.computerId === c.id)) {
                    // If it's a virus, we don't break it yet, we wait for the mini-game? 
                    // Or we mark it as broken/infected?
                    // The laser-game logic didn't seem to change status immediately in triggerEvents, 
                    // but the main logic sets status to 'broken'.
                    // Let's check the event type.
                    const event = newEvents.find(e => e.computerId === c.id);
                    if (event?.type === 'virus_attack') {
                        return { ...c, status: 'infected' as ComputerStatus };
                    }
                    return { ...c, status: 'broken' as ComputerStatus };
                }
                return c;
            });
            set((state) => ({
                events: [...state.events, ...newEvents],
                computers: updatedComputers,
            }));
        }
        return newEvents.length;
    },

    planAction: (eventId, action) => {
        const { computers, events, budget, maintenanceActionsUsed } = get();
        const event = events.find(e => e.id === eventId);
        if (!event) return;

        // If it's a virus attack, we need to play the game
        if (event.type === 'virus_attack' && action === 'repair') {
            set({ activeMiniGame: { type: 'laser', eventId } });
            return;
        }

        const cost = action === 'repair' ? GAME_CONFIG.REPAIR_COST :
            action === 'linux' ? GAME_CONFIG.LINUX_COST :
                action === 'linux_fix' ? 0 : 0;

        if (budget < cost) return;

        // Check limit
        if (maintenanceActionsUsed >= GAME_CONFIG.MAX_MAINTENANCE_ACTIONS_PER_TURN) {
            // Allow changing action if already planned? No, simplistic approach first.
            // Actually, if we are changing an action, we shouldn't increment.
            // But here we are planning an action for an event.
            // If the PC already has a pending action, we are just changing it, so no increment?
            // The event system is a bit different from PC slot actions.
            // Let's assume this counts as a maintenance action if it's not already planned.
            // BUT wait, `planAction` is used for events. `toggleLinux` and `replaceComputer` are for slots.
            // Events usually don't have "pendingAction" on the computer directly in the same way?
            // Actually `planAction` updates `computers` with `pendingAction`.

            // Let's check if this specific computer already has a pending action.
            const pc = computers.find(c => c.id === event.computerId);
            if (!pc) return;

            if (!pc.pendingAction) {
                if (maintenanceActionsUsed >= GAME_CONFIG.MAX_MAINTENANCE_ACTIONS_PER_TURN) return;
                set({ maintenanceActionsUsed: maintenanceActionsUsed + 1 });
            }
        } else {
            const pc = computers.find(c => c.id === event.computerId);
            if (pc && !pc.pendingAction) {
                set({ maintenanceActionsUsed: maintenanceActionsUsed + 1 });
            }
        }

        const updatedComputers = computers.map(c =>
            c.id === event.computerId ? { ...c, pendingAction: action } : c
        );

        set({ computers: updatedComputers });
    },

    resolveMiniGame: (success: boolean) => {
        const { activeMiniGame, computers, events } = get();
        if (!activeMiniGame) return;

        // Test mode handling
        if (activeMiniGame.eventId === 'test') {
            set({ activeMiniGame: null });
            return;
        }

        const event = events.find(e => e.id === activeMiniGame.eventId);
        if (event) {
            const updatedComputers = computers.map(c => {
                if (c.id === event.computerId) {
                    // Success -> Working, Failure -> Destroyed
                    return { ...c, status: (success ? 'working' : 'destroyed') as ComputerStatus };
                }
                return c;
            });

            // Remove event regardless of outcome (it's resolved either by fix or infection persistence?)
            // Actually if it stays infected, maybe we should keep the event?
            // For now let's remove it to avoid blocking.
            const updatedEvents = events.filter(e => e.id !== activeMiniGame.eventId);

            set({
                computers: updatedComputers,
                events: updatedEvents,
                activeMiniGame: null
            });
        } else {
            set({ activeMiniGame: null });
        }
    },

    replaceComputer: (id: string) => {
        const { computers, budget, maintenanceActionsUsed } = get();
        const COST = GAME_CONFIG.REPLACEMENT_COST;

        if (budget < COST) {
            alert("Pas assez de budget pour planifier le remplacement !");
            return;
        }

        const pc = computers.find(c => c.id === id);
        if (!pc || pc.status !== 'destroyed') return;

        // If already pending replace, cancel it? Or just ignore?
        if (pc.pendingAction === 'replace') return;

        // Check limit
        if (maintenanceActionsUsed >= GAME_CONFIG.MAX_MAINTENANCE_ACTIONS_PER_TURN) return;

        const updatedComputers = computers.map(c =>
            c.id === id ? { ...c, pendingAction: 'replace' as ActionType } : c
        );

        set({
            computers: updatedComputers,
            maintenanceActionsUsed: maintenanceActionsUsed + 1
        });
    },

    openLaserGame: (eventId: string = 'test') => {
        set({ activeMiniGame: { type: 'laser', eventId } });
    },

    planTraining: () => {
        const { budget, turn, lastTrainingTurn, pendingTraining, specialActionsUsed } = get();

        // Check cooldown
        if (lastTrainingTurn !== null && turn - lastTrainingTurn < GAME_CONFIG.TRAINING_COOLDOWN_TURNS) return;

        // Check already pending (toggle off?)
        if (pendingTraining) {
            set({
                pendingTraining: false,
                specialActionsUsed: Math.max(0, specialActionsUsed - 1)
            });
            return;
        }

        // Check limit
        if (specialActionsUsed >= GAME_CONFIG.MAX_SPECIAL_ACTIONS_PER_TURN) return;

        if (budget >= GAME_CONFIG.TRAINING_COST) {
            set({
                pendingTraining: true,
                specialActionsUsed: specialActionsUsed + 1
            });
        }
    },

    planMigration: (classroomId) => {
        const { budget, pendingMigrations, computers, specialActionsUsed } = get();

        // Check already pending (toggle off)
        if (pendingMigrations.includes(classroomId)) {
            set({
                pendingMigrations: pendingMigrations.filter(id => id !== classroomId),
                specialActionsUsed: Math.max(0, specialActionsUsed - 1)
            });
            return;
        }

        // Check limit
        if (specialActionsUsed >= GAME_CONFIG.MAX_SPECIAL_ACTIONS_PER_TURN) return;

        // Check if affordable
        if (budget < GAME_CONFIG.LIBREOFFICE_MIGRATION_COST) return;

        // Check if needed (any Office PC in class)
        const hasOffice = computers.some(c => c.classroomId === classroomId && c.software === 'office');
        if (!hasOffice) return;

        set({
            pendingMigrations: [...pendingMigrations, classroomId],
            specialActionsUsed: specialActionsUsed + 1
        });
    },

    toggleLinux: (computerId) => {
        const { computers, budget, maintenanceActionsUsed } = get();
        const pc = computers.find(c => c.id === computerId);

        if (!pc || pc.status === 'broken' || pc.status === 'infected' || pc.status === 'destroyed' || pc.os === 'linux') return;

        // If already pending linux, cancel it
        if (pc.pendingAction === 'linux') {
            const updatedComputers = computers.map(c =>
                c.id === computerId ? { ...c, pendingAction: null } : c
            );
            set({
                computers: updatedComputers,
                maintenanceActionsUsed: Math.max(0, maintenanceActionsUsed - 1)
            });
            return;
        }

        // If not pending, plan it (check budget and limit)
        if (maintenanceActionsUsed >= GAME_CONFIG.MAX_MAINTENANCE_ACTIONS_PER_TURN) return;

        if (budget >= GAME_CONFIG.LINUX_COST) {
            const updatedComputers = computers.map(c =>
                c.id === computerId ? { ...c, pendingAction: 'linux' as ActionType } : c
            );
            set({
                computers: updatedComputers,
                maintenanceActionsUsed: maintenanceActionsUsed + 1
            });
        }
    },

    planParty: () => {
        const { budget, partyPlanned, specialActionsUsed } = get();

        if (partyPlanned) {
            set({
                partyPlanned: false,
                specialActionsUsed: Math.max(0, specialActionsUsed - 1)
            });
            return;
        }

        if (specialActionsUsed >= GAME_CONFIG.MAX_SPECIAL_ACTIONS_PER_TURN) return;

        if (budget >= GAME_CONFIG.PARTY_COST) {
            set({
                partyPlanned: true,
                specialActionsUsed: specialActionsUsed + 1
            });
        }
    },

    installLocalServer: () => {
        const { budget, pendingLocalServer, localServerCount, specialActionsUsed } = get();

        // If already pending, cancel it
        if (pendingLocalServer) {
            set({
                pendingLocalServer: false,
                specialActionsUsed: Math.max(0, specialActionsUsed - 1)
            });
            return;
        }

        // Limit to 8 servers max
        if (localServerCount >= 8) return;

        // Check limit
        if (specialActionsUsed >= GAME_CONFIG.MAX_SPECIAL_ACTIONS_PER_TURN) return;

        // If not pending, plan it (check budget)
        if (budget >= GAME_CONFIG.LOCAL_SERVER_COST) {
            set({
                pendingLocalServer: true,
                specialActionsUsed: specialActionsUsed + 1
            });
        }
    },

    stopDisco: () => {
        set({ discoActive: false });
    },

    startExecution: () => {
        set({ phase: 'executing' });
    },

    applyTurn: () => {
        const { computers, events, budget, turn, maxTurns, happiness, dependency, pendingTraining, pendingMigrations, partyPlanned, pendingLocalServer, localServerCount } = get();

        let newBudget = budget;
        let newComputers = [...computers];
        let newEvents = [...events];
        let newHappiness = happiness;
        let newDependency = dependency;

        let expenses = 0;
        let resolvedEventsCount = 0;
        let infectedCount = 0;
        let warningMessage: string | undefined = undefined;

        // Tracking individual expenses
        let trainingCost = 0;
        let migrationCost = 0;
        let partyCost = 0;
        let serverCost = 0;
        let maintenanceCost = 0;

        // 1. Deduct Office License Costs
        const officePcs = computers.filter(c => c.software === 'office').length;
        const officeLicenseCost = officePcs * GAME_CONFIG.OFFICE_LICENSE_COST;
        newBudget -= officeLicenseCost;
        expenses += officeLicenseCost;

        // 2. Deduct Data Storage Costs
        const workingPcsCount = computers.filter(c => c.status === 'working').length;
        const coveredPcs = localServerCount * GAME_CONFIG.LOCAL_SERVER_CAPACITY;
        const exposedPcs = Math.max(0, workingPcsCount - coveredPcs);
        const dataCost = exposedPcs * GAME_CONFIG.DATA_COST_PER_PC;

        newBudget -= dataCost;
        expenses += dataCost;

        // 3. Apply Pending Training
        let updatedLastTrainingTurn = get().lastTrainingTurn;
        if (pendingTraining) {
            trainingCost = GAME_CONFIG.TRAINING_COST;
            newBudget -= trainingCost;
            expenses += trainingCost;
            newDependency = Math.max(0, newDependency - GAME_CONFIG.DEPENDENCY_REDUCTION_TRAINING);
            updatedLastTrainingTurn = turn;
        }

        // 4. Apply Pending Migrations
        pendingMigrations.forEach(classroomId => {
            const cost = GAME_CONFIG.LIBREOFFICE_MIGRATION_COST;
            newBudget -= cost;
            expenses += cost;
            migrationCost += cost;
            const loss = GAME_CONFIG.HAPPINESS_LOSS_LIBREOFFICE + (newDependency * GAME_CONFIG.DEPENDENCY_FACTOR);
            newHappiness = Math.max(0, newHappiness - loss);
            // Reduce dependency
            newDependency = Math.max(0, newDependency - GAME_CONFIG.DEPENDENCY_REDUCTION_SOFTWARE);

            newComputers = newComputers.map(c => {
                if (c.classroomId === classroomId && c.software === 'office') {
                    return { ...c, software: 'libreoffice' as Software };
                }
                return c;
            });
        });

        // 5. Apply Party (Soirée Logiciel Libre)
        let newDiscoActive = false;
        if (partyPlanned) {
            partyCost = GAME_CONFIG.PARTY_COST;
            newBudget -= partyCost;
            expenses += partyCost;
            newHappiness = Math.min(GAME_CONFIG.MAX_HAPPINESS, newHappiness + GAME_CONFIG.PARTY_HAPPINESS_GAIN);
            newDiscoActive = true; // Activer le disco floor !
        }

        // 6. Apply Local Server Installation
        let newLocalServerCount = localServerCount;
        if (pendingLocalServer) {
            serverCost = GAME_CONFIG.LOCAL_SERVER_COST;
            newBudget -= serverCost;
            expenses += serverCost;
            newLocalServerCount += 1;
        }

        // 7. Apply PC Actions (Repair/Linux)
        newComputers = newComputers.map(c => {
            if (c.pendingAction) {
                let cost = 0;
                if (c.pendingAction === 'repair') cost = GAME_CONFIG.REPAIR_COST;
                else if (c.pendingAction === 'linux') cost = GAME_CONFIG.LINUX_COST;
                else if (c.pendingAction === 'replace') cost = GAME_CONFIG.REPLACEMENT_COST;
                else if (c.pendingAction === 'linux_fix') cost = 0;

                newBudget -= cost;
                expenses += cost;
                maintenanceCost += cost;

                let newStatus = 'working';
                let newOs = c.os;
                let newSoftware = c.software;

                if (c.pendingAction === 'replace') {
                    newStatus = 'working';
                    newOs = 'windows';
                    newSoftware = 'office';
                    // Reset installation turn for immunity
                    resolvedEventsCount++;
                    return { ...c, status: newStatus as ComputerStatus, os: newOs as OS, software: newSoftware as Software, pendingAction: null, installationTurn: turn };
                } else if (c.pendingAction === 'linux' || c.pendingAction === 'linux_fix') {
                    newOs = 'linux';
                    newSoftware = 'libreoffice';
                }

                // Happiness penalty for Linux migration
                if (c.pendingAction === 'linux' || c.pendingAction === 'linux_fix') {
                    const loss = GAME_CONFIG.HAPPINESS_LOSS_LINUX + (dependency * GAME_CONFIG.DEPENDENCY_FACTOR);
                    newHappiness = Math.max(0, newHappiness - loss);
                }

                newEvents = newEvents.filter(e => e.computerId !== c.id);
                resolvedEventsCount++;

                return { ...c, status: newStatus as ComputerStatus, os: newOs as OS, software: newSoftware as Software, pendingAction: null };
            }
            return c;
        });

        // Count infected/destroyed for summary (based on events or status?)
        // Auto-destroy infected PCs that were not cured
        const infectedPcs = newComputers.filter(c => c.status === 'infected');
        if (infectedPcs.length > 0) {
            newComputers = newComputers.map(c =>
                c.status === 'infected' ? { ...c, status: 'destroyed' as ComputerStatus } : c
            );
            warningMessage = "ATTENTION : Des PC infectés ont été détruits par le virus !";
            // Remove virus events associated with these PCs so they don't persist as active events
            newEvents = newEvents.filter(e => !infectedPcs.find(pc => pc.id === e.computerId));
        }

        // Count current destroyed (including newly destroyed)
        infectedCount = newComputers.filter(c => c.status === 'destroyed').length;

        // 7b. Reduce dependency based on Linux PCs only (LibreOffice alone doesn't reduce Big Tech dependency)
        const freePcsCount = newComputers.filter(c => c.os === 'linux').length;
        const dependencyReduction = freePcsCount * GAME_CONFIG.DEPENDENCY_REDUCTION_PER_FREE_PC;
        newDependency = Math.max(0, newDependency - dependencyReduction);

        // 8. Income (Based on working PCs)
        const finalWorkingPcsCount = newComputers.filter(c => c.status === 'working').length;
        const income = finalWorkingPcsCount * GAME_CONFIG.INCOME_PER_PC;
        newBudget += income;

        // 9. Check Game Over
        if (newHappiness <= 0) {
            set({
                gameOver: true,
                gameOverReason: "Le proviseur a été renvoyé suite aux plaintes des utilisateurs ! (Bonheur à 0%)",
                phase: 'start'
            });
            return;
        }

        // Global Event: Collectivité Intervention at Turn 12 (Configurable)
        // We check if the NEXT turn matches the config
        let interventionMessage = null;
        if (turn + 1 === GAME_CONFIG.INTERVENTION_TURN) {
            // Only trigger if dependency is high enough
            if (dependency > GAME_CONFIG.INTERVENTION_DEPENDENCY_THRESHOLD) {
                const interventionAmount = GAME_CONFIG.INTERVENTION_COST;
                newBudget -= interventionAmount;
                interventionMessage = `La Collectivité Territoriale a réduit votre budget de ${interventionAmount}€ car votre dépendance aux Big Tech est trop élevée (> ${GAME_CONFIG.INTERVENTION_DEPENDENCY_THRESHOLD}%) !`;
            }
        }

        if (turn < maxTurns) {
            // Store current happiness to calculate change for summary
            const initialHappiness = get().happiness;

            // Round values to 2 decimal places
            const roundedHappiness = Math.round(newHappiness * 100) / 100;
            const roundedDependency = Math.round(newDependency * 100) / 100;
            const roundedBudget = Math.round(newBudget * 100) / 100;

            set({
                turn: turn + 1,
                phase: 'planning',
                budget: roundedBudget,
                computers: newComputers,
                events: newEvents,
                happiness: roundedHappiness,
                dependency: roundedDependency,
                pendingTraining: false,
                pendingMigrations: [],
                partyPlanned: false,
                pendingLocalServer: false,
                localServerCount: newLocalServerCount,
                lastTrainingTurn: updatedLastTrainingTurn,
                discoActive: newDiscoActive,
                maintenanceActionsUsed: 0,
                specialActionsUsed: 0
            });

            // Now trigger events for the new turn
            const newEventsCount = get().triggerEvents(); // This will update events and computers (broken status)



            set({
                turnSummary: {
                    income: Math.round(income * 100) / 100,
                    expenses: Math.round(expenses * 100) / 100,
                    happinessChange: Math.round((roundedHappiness - initialHappiness) * 100) / 100,
                    newEvents: newEventsCount,
                    resolvedEvents: resolvedEventsCount,
                    // Détail des dépenses
                    officeLicenseCost: Math.round(officeLicenseCost * 100) / 100,
                    dataCost: Math.round(dataCost * 100) / 100,
                    trainingCost: Math.round(trainingCost * 100) / 100,
                    migrationCost: Math.round(migrationCost * 100) / 100,
                    partyCost: Math.round(partyCost * 100) / 100,
                    serverCost: Math.round(serverCost * 100) / 100,
                    maintenanceCost: Math.round(maintenanceCost * 100) / 100,
                    infectedCount,
                    warning: warningMessage,
                    specialEvent: interventionMessage || undefined
                },
                showTurnSummary: true
            });

        } else {
            set({
                gameOver: true,
                gameOverReason: "Fin de la mission ! Avez-vous réussi à libérer le village ?",
                phase: 'start'
            });
        }
    },

    reduceBudget: (amount: number) => {
        set((state) => ({
            budget: Math.max(0, state.budget - amount)
        }));
    },

    unlockClassroom: (classroomId: number) => {
        const { budget, unlockedClassrooms, computers } = get();

        if (unlockedClassrooms.includes(classroomId)) return;

        let cost = 0;
        if (classroomId === 3) cost = GAME_CONFIG.UNLOCK_COST_CLASSROOM_3;
        if (classroomId === 4) cost = GAME_CONFIG.UNLOCK_COST_CLASSROOM_4;

        if (budget >= cost) {
            // Generate new PCs
            const newPCs: Computer[] = Array.from({ length: GAME_CONFIG.NEW_CLASSROOM_PC_COUNT }).map((_, i) => ({
                id: `C${classroomId}-${i + 1}`,
                classroomId,
                status: 'working',
                os: 'linux', // New classrooms come with Linux!
                software: 'libreoffice',
                installationTurn: get().turn, // Immune for a while
                pendingAction: null
            }));

            set({
                budget: budget - cost,
                unlockedClassrooms: [...unlockedClassrooms, classroomId],
                computers: [...computers, ...newPCs]
            });
        }
    }
}));
