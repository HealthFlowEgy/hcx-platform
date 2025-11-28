package org..dp.preauth.functions;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org..dp.core.function.BaseDispatcherFunction;
import org..dp.core.function.ValidationResult;
import org..dp.preauth.task.PreauthConfig;

import java.util.Map;

public class PreauthProcessFunction extends BaseDispatcherFunction {

  private Logger logger = LoggerFactory.getLogger(PreauthProcessFunction.class);
  private PreauthConfig config;

  public PreauthProcessFunction(PreauthConfig config) {
    super(config);
    this.config = config;
  }

  @Override
  public ValidationResult validate(Map<String, Object> event) {
    // TODO: Add domain specific validations
    return new ValidationResult(true, null);
  }

}



