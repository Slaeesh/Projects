export const GAME_CONFIG = {
    // Time settings
    TURN_DURATION_MS: 4000, // Duration of the "month passing" animation (was 10000)

    // Economy
    INITIAL_BUDGET: 1000,
    INCOME_PER_TURN: 100,
    REPAIR_COST: 100,
    LINUX_COST: 0,

    // Difficulty
    MIN_CRASHES_PER_TURN: 0,
    MAX_CRASHES_PER_TURN: 2,
    CRASH_PROBABILITY: 0.7, // Chance that a crash check happens at all

    // Game Length
    MAX_TURNS: 48,

    // Advanced Mechanics
    MAX_HAPPINESS: 100,
    MAX_DEPENDENCY: 100,

    // Costs & Penalties
    TRAINING_COST: 300,
    LIBREOFFICE_MIGRATION_COST: 100, // Per classroom
    OFFICE_LICENSE_COST: 10, // Per PC per turn

    HAPPINESS_LOSS_LINUX: 5, // Base loss
    HAPPINESS_LOSS_LIBREOFFICE: 3, // Base loss

    DEPENDENCY_REDUCTION_TRAINING: 5, // 5% pour compenser la réduction par PC
    DEPENDENCY_REDUCTION_SOFTWARE: 5, // New config
    DEPENDENCY_REDUCTION_PER_FREE_PC: 0.5, // Réduction par PC Linux ou LibreOffice
    DEPENDENCY_FACTOR: 0.1, // Multiplier for happiness loss based on dependency
    TRAINING_COOLDOWN_TURNS: 3,

    // Economy
    INCOME_PER_PC: 30,

    // Events
    PARTY_COST: 500,
    PARTY_HAPPINESS_GAIN: 20,

    // Infrastructure
    DATA_COST_PER_PC: 15,
    LOCAL_SERVER_COST: 800,
    LOCAL_SERVER_CAPACITY: 5,

    // Virus & Events
    VIRUS_PROBABILITY: 0.1,
    REPLACEMENT_COST: 500,
    IMMUNITY_DURATION: 2, // Turns

    // Special Events
    INTERVENTION_TURN: 12,
    INTERVENTION_DEPENDENCY_THRESHOLD: 75,
    INTERVENTION_COST: 500,

    // Unlockable Classrooms
    UNLOCK_COST_CLASSROOM_3: 1000,
    UNLOCK_COST_CLASSROOM_4: 1500,
    DEPENDENCY_THRESHOLD_CLASSROOM_3: 75,
    DEPENDENCY_THRESHOLD_CLASSROOM_4: 50,
    NEW_CLASSROOM_PC_COUNT: 10,

    // Action Limits
    MAX_MAINTENANCE_ACTIONS_PER_TURN: 3,
    MAX_SPECIAL_ACTIONS_PER_TURN: 1,

    // Visuals
    PNJ_COUNT: 6,
    ADMIN_COUNT: 4,
    ADMIN_SPEED: 3,
};
