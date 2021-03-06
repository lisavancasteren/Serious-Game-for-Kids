class SimulationController extends Controller
{
    /**
     * Called by InitGameController once the views have been loaded and the game is ready.
     */
    run()
    {
        this._setup();

        this.running = setInterval(
            $.proxy(this._run, this),
            1000 / GAME.model.config.hour
        );
    }

    /**
     * @augments Controller.registerEvent
     */
    registerEvent()
    {
        const $handle = $(".timer");

        $handle.click(function () {
            $handle.each((i, elem) => $(elem).removeClass("active"));

            const elem = $(this).children(":first");
            const sim = new SimulationController();

            GAME.model.config.isPaused = true;

            if (elem.hasClass("glyphicon-play")) {
                sim.run();
            }

            $(this).addClass("active");
        });
    }

    /**
     * @private
     */
    _run()
    {
        if (GAME.model.config.isPaused) {
            clearInterval(this.running);
        }

        GAME.model.config.hours++;

        this._runHour();

        if (GAME.model.config.hours % 24 == 0) {
            this._runDay();
        }
    }

    /**
     * @private
     */
    _runHour()
    {
        const demandGenerator = new DemandController();

        demandGenerator.doCustomerOrderGeneration();
        FactoryController.updateOrder();

        $(".timer-hours").html(GAME.model.config.hours % 24);
    }

    /**
     * @private
     */
    _runDay()
    {
        const days = Math.floor(GAME.model.config.hours / 24);
        const quarterYear = Math.floor(GAME.model.config.yearDays / 4);

        const warehouseController = new WarehouseController();
        const levelController = new LevelController();

        warehouseController.updateHoldingCost();
        warehouseController.updatePerishableProducts();

        warehouseController.updateContainerView();
        warehouseController.updateCapacityView();

        levelController.checkGoalReached();
        
        if (days % quarterYear == 0) {
            GAME.model.config.seasonCount++;
            GAME.model.config.season = GAME.model.config.seasons[GAME.model.config.seasonCount % 3];

            $(".season").html(Controller.l(GAME.model.config.season));
            toastr.success(Controller.l("It is now") + " " + Controller.l(GAME.model.config.season).toLowerCase());
        }

        $(".timer-days").html(GAME.model.config.hours / 24);
    }

    /**
     * @private
     */
    _setup()
    {
        if (!GAME.model.config.hasOwnProperty("hours")) {
            GAME.model.config.hours = 0;
        }

        if (!GAME.model.config.hasOwnProperty("seasonCount")) {
            GAME.model.config.seasonCount = 0;
        }

        GAME.model.config.isPaused = false;
    }
}
