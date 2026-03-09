function calculateDailySteps(weight: number, age: number, height: number): number {
    // Base step goal
    const baseSteps: number = 10000;
    
    // Adjust for weight
    let stepAdjustment: number;
    if (weight < 120) {  // Light weight
        stepAdjustment = 1.1;  // Slightly higher steps needed
    } else if (weight > 200) {  // Heavier weight
        stepAdjustment = 0.9;  // Fewer steps needed
    } else {
        stepAdjustment = 1;  // No adjustment needed
    }
    
    // Adjust for age
    let ageAdjustment: number;
    if (age >= 65) {
        ageAdjustment = 0.8;  // Older adults need fewer steps
    } else if (age < 30) {
        ageAdjustment = 1.2;  // Younger adults might aim for more steps
    } else {
        ageAdjustment = 1;  // Standard adjustment for adults aged 30–64
    }
    
    // Adjust for height (longer stride for taller individuals)
    let heightAdjustment: number;
    if (height > 180) {  // Taller people
        heightAdjustment = 0.9;  // Fewer steps needed
    } else if (height < 150) {  // Shorter people
        heightAdjustment = 1.1;  // More steps needed
    } else {
        heightAdjustment = 1;  // Standard adjustment for average height
    }
    
    // Final calculation
    const dailySteps = baseSteps * stepAdjustment * ageAdjustment * heightAdjustment;
    return Math.round(dailySteps);
}