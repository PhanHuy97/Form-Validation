// doi tuong `validator`
function Validator(options) {
  //ham thuc thi kiem tra loi
  function getParent(element, selector) {
    while (element.parentElement) {
      if (element.parentElement.matches(selector)) {
        return element.parentElement;
      }
      element = element.parentElement;
    }
  }
  function validate(inputElement, rule) {
    let errorMessager;
    const errorElement = getParent(
      inputElement,
      options.formGroupSelector
    ).querySelector(options.errorSeletor);
    // lay ra ca rule cua cac input
    const rules = selectorRules[rule.selector];
    // lap qua tung rule de kiem tra neu lỗi thì thoát vòng lặp
    for (let i = 0; i < rules.length; i++) {
      switch (inputElement.type) {
        case "checkbox":
        case "radio":
          errorMessager = rules[i](
            formElement.querySelector(rule.selector + ":checked")
          );
          break;
        default:
          errorMessager = rules[i](inputElement.value);
      }

      if (errorMessager) break;
    }
    if (errorMessager) {
      errorElement.innerText = errorMessager;
      getParent(inputElement, options.formGroupSelector).classList.add(
        "invalid"
      );
    } else {
      errorElement.innerText = "";
      getParent(inputElement, options.formGroupSelector).classList.remove(
        "invalid"
      );
    }
    return !errorMessager;
  }

  const selectorRules = {};

  const formElement = document.querySelector(options.form);
  if (formElement) {
    // xu li bam vao nut submit
    formElement.onsubmit = (e) => {
      e.preventDefault();
      let isFormValid = true;
      //lap qua tung rule va validate
      options.rules.forEach((rule) => {
        const inputElement = formElement.querySelector(rule.selector);
        let isValid = validate(inputElement, rule);
        if (!isValid) {
          isFormValid = isValid;
        }
      });
      if (isFormValid) {
        // truong hop submit javascrip
        if (typeof options.onSubmit === "function") {
          const enabledInputElements = formElement.querySelectorAll(
            "[name]:not([disabled])"
          );
          const formValues = Array.from(enabledInputElements).reduce(
            (values, enabledInputElement) => {
              switch (enabledInputElement.type) {
                case "radio":
                  if (enabledInputElement.matches(":checked")) {
                    values[enabledInputElement.name] =
                      enabledInputElement.value;
                  }
                  break;
                case "checkbox":
                  if (!Array.isArray(values[enabledInputElement.name])) {
                    values[enabledInputElement.name] = [];
                  }
                  if (enabledInputElement.matches(":checked")) {
                    values[enabledInputElement.name].push(
                      enabledInputElement.value
                    );
                  }
                  break;
                case "file":
                  values[enabledInputElement.name] = enabledInputElement.files;
                  break;
                default:
                  values[enabledInputElement.name] = enabledInputElement.value;
              }
              return values;
            },
            {}
          );
          options.onSubmit(formValues);
        }
        // Submit voi hanh vi mac dinh
        else {
          formElement.submit();
        }
      }
    };

    // lap qua tung rule de xu li
    options.rules.forEach((rule) => {
      // Xu li luu cac rule cho moi input
      if (Array.isArray(selectorRules[rule.selector])) {
        selectorRules[rule.selector].push(rule.test);
      } else {
        selectorRules[rule.selector] = [rule.test];
      }

      const inputElements = formElement.querySelectorAll(rule.selector);
      Array.from(inputElements).forEach((inputElement) => {
        if (inputElement) {
          // Su li truong hop blur ra ngoai
          inputElement.onblur = () => {
            validate(inputElement, rule);
          };
          // Su li truong hop go vao input
          inputElement.oninput = () => {
            const errorElement = getParent(
              inputElement,
              options.formGroupSelector
            ).querySelector(options.errorSeletor);
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove(
              "invalid"
            );
          };
          inputElement.onchange = () => {
            const errorElement = getParent(
              inputElement,
              options.formGroupSelector
            ).querySelector(options.errorSeletor);
            errorElement.innerText = "";
            getParent(inputElement, options.formGroupSelector).classList.remove(
              "invalid"
            );
          };
        }
      });
    });
  }
}

// dinh nghia rules
// nguyen tac cua cac rules
// 1. khi co loi tra ra message loi
// 2. khi hop le tra ra undefined
Validator.isRequired = (selector, message) => {
  return {
    selector: selector,
    test: (value) => {
      return value ? undefined : message || "Vui lòng nhập trường này";
    },
  };
};

Validator.isEmail = (selector, message) => {
  return {
    selector: selector,
    test: (value) => {
      const regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      return regex.test(value)
        ? undefined
        : message || "Vui lòng nhập đúng email của bạn";
    },
  };
};

Validator.minLength = (selector, min, message) => {
  return {
    selector: selector,
    test: (value) => {
      return value.length >= min
        ? undefined
        : message || `Vui lòng nhập đủ ${min} kí tự`;
    },
  };
};

Validator.isConfirmed = (selector, getConfirmValue, message) => {
  return {
    selector: selector,
    test: (value) => {
      return value === getConfirmValue()
        ? undefined
        : message || "Giá trị nhập vào không chính xác";
    },
  };
};
