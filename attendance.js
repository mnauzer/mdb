function prepocitatZaznamDochadzky(en, initScript) {
    setAppScripts('prepocitatZaznamDochadzky()', 'calc.js', initScript);
    try {
        // Input validation
        if (!en || !en.field(DATE)) {
            throw new Error('Invalid entry or missing date');
        }

        const datum = en.field(DATE);
        const zamestnanci = en.field("Zamestnanci");

        // Initialize totals with proper types
        const totals = {
            mzdy: 0,
            odpracovane: 0,
            evidencia: 0,
            prestoje: 0
        };

        // Validate and process time entries
        const prichod = validateAndRoundTime(en.field("Príchod"));
        const odchod = validateAndRoundTime(en.field("Odchod"));

        if (!prichod || !odchod || prichod >= odchod) {
            throw new Error('Invalid arrival/departure times');
        }

        // Update times in single batch
        en.set({
            "Príchod": prichod,
            "Odchod": odchod
        });

        const pracovnaDoba = calculateWorkHours(prichod, odchod);

        // Process employees
        if (zamestnanci?.length) {
            for (const zamestnanec of zamestnanci) {
                const employeeData = processEmployee(zamestnanec, datum, pracovnaDoba);
                updateTotals(totals, employeeData);
            }
        }

        // Update entry with totals
        updateEntryTotals(en, totals, pracovnaDoba);

        if (app.log) {
            message("Výpočet dokončený");
        }

    } catch (error) {
        createErrorEntry(app.runningScript, error);
        throw error; // Re-throw to prevent silent failures
    }
}

// Helper functions
function validateAndRoundTime(time) {
    if (!time) {
        throw new Error('Missing time value');
    }
    return roundTimeQ(time);
}

function calculateWorkHours(start, end) {
    return (end - start) / 3600000;
}

function processEmployee(zamestnanec, datum, pracovnaDoba) {
    const hodinovka = employees.sadzba(zamestnanec, datum);
    if (!hodinovka || hodinovka <= 0) {
        throw new Error(`Invalid hourly rate for employee: ${zamestnanec.field("nick")}`);
    }

    // Calculate wages with bonuses and penalties
    const dennaMzda = calculateDailyWage(
        pracovnaDoba,
        hodinovka,
        zamestnanec.attr("+príplatok (€/h)") || 0,
        zamestnanec.attr("+prémia (€)") || 0,
        zamestnanec.attr("-pokuta (€)") || 0
    );

    // Update employee attributes in batch
    zamestnanec.setAttr({
        "odpracované": pracovnaDoba,
        "hodinovka": hodinovka,
        "denná mzda": dennaMzda
    });

    return {
        mzda: dennaMzda,
        odpracovane: pracovnaDoba
    };
}

function calculateDailyWage(hours, rate, bonus, premium, penalty) {
    return (hours * (rate + bonus)) + premium - penalty;
}

function updateTotals(totals, employeeData) {
    totals.mzdy += employeeData.mzda;
    totals.odpracovane += employeeData.odpracovane;
}

function updateEntryTotals(en, totals, pracovnaDoba) {
    totals.prestoje = totals.odpracovane - totals.evidencia;

    en.set({
        "Mzdové náklady": totals.mzdy.toFixed(2),
        "Pracovná doba": pracovnaDoba,
        "Odpracované": totals.odpracovane,
        "Na zákazkách": totals.evidencia,
        "Prestoje": totals.prestoje
    });

    if (totals.prestoje === totals.odpracovane) {
        handleFullIdle(en);
    }
}

function handleFullIdle(en) {
    // Handle case when all time is idle
    // Currently commented out in original code
    // Implement if needed
}