package org..dp.predetermination.functions;


import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org..dp.core.function.BaseDispatcherFunction;
import org..dp.core.function.ValidationResult;
import org..dp.predetermination.task.PredeterminationConfig;

import java.util.Map;

public class PredeterminationProcessFunction extends BaseDispatcherFunction {

    private Logger logger = LoggerFactory.getLogger(PredeterminationProcessFunction.class);
    private PredeterminationConfig config;

    public PredeterminationProcessFunction(PredeterminationConfig config) {
        super(config);
        this.config = config;
    }

    @Override
    public ValidationResult validate(Map<String, Object> event) {
        // TODO: Add domain specific validations
        return new ValidationResult(true, null);
    }

}


