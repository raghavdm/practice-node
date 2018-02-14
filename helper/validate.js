let utils = require('../helper/utils');
let mongooseUtil = require('../helper/mongooseUtil');
let validator = {};
validator.isValid = (str) => {
    if (typeof str !== 'string' || utils.empty(str)) {
        return false;
    }
    return true;
}
validator.notEmpty = (str) => {
    return !utils.empty(str);
}
validator.isString = (str) => {
    if (validator.isValid(str)) {
        let string = /^[a-zA-Z0-9]+$/
        return string.test(str)
    }
    return false;
}
validator.isInt = (str) => {
    if (validator.isValid(str)) {
        let int = /^(?:[-+]?(?:0|[1-9][0-9]*))$/;
        return int.test(str);
    }
    return false;
}
validator.isFloat = (str) => {
    if (validator.isValid(str)) {
        let float = /^(?:[-+]?(?:[0-9]+))?(?:\.[0-9]*)?(?:[eE][\+\-]?(?:[0-9]+))?$/;
        if (str === '.') {
            return false;
        }
        return float.test(str);
    }
    return false;
}
validator.isEmail = (str) => {
    if (validator.isValid(str)) {
        let email = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return email.test(str);
    }
    return false;
}
validator.isNumber = (num) => {
    return !isNaN(num);
}
validator.isValidRex = (str) => {
    if (validator.isValid(str)) {
        if (!utils.empty(rex)) {
            return rex.test(str);
        }
        return false;
    } else {
        return false;
    }
}
validator.isValidEnum = (str) => {
    if (validator.isValid(str)) {
        if (!utils.empty(enumArray) && enumArray.indexOf(str) !== -1) {
            return true;
        }
        return false;
    }
    return false;
}
validator.validPassword = (str) => {
    if (validator.isValid(str)) {
        if (str.length >= 6 && str.length <= 20) {
            var password = /^(?:[0-9]+[a-z]|[a-z]+[0-9])[a-z0-9]*$/i;
            return password.test(str);
        }
        return false;
    }
    return false;
}
validator.validZipcode = (str) => {
    if (validator.isValid(str)) {
        if (str.length >= 5) {
            var zip = /(^\d{5}$)|(^\d{5}-\d{4}$)/;
            return zip.test(str);
        }
        return false;
    }
    return false;
}
validator.range = (str, data) => {
    if (validator.isValid(str)) {
        var len = str.length;
        if (_.isArray(data)) {
            var start = data[0];
            var end = data[1];
            if (!utils.empty(end)) {
                return (len >= start && len < end);
            } else {
                return (len >= start);
            }
        } else {
            return false;
        }
    }
    return false;
}
validator.isValidEnum = (str, enumArray) => {
    if (!utils.empty(str) && validator.isValid(str.toString())) {
        if (!utils.empty(enumArray) && enumArray.indexOf(str.toString()) !== -1) {
            return true;
        }
        return false;
    }
    return false;

}

validator.isDate = (date) => {
    let newDate = new Date(date);
    return !isNaN(newDate.getTime());
}

validator.isMongoId = (object) => {
    return mongooseUtil.isMongoId(object);
}

validator.isTime = (time) => {
    var isValid = /^([0-1]?[0-9]|2[0-4]):([0-5][0-9])(:[0-5][0-9])?$/.test(time);
    return isValid;
}

validator.isScheduleData = (data) => {
    if (utils.empty(data))
        return false;
    if (data.length < 0)
        return false;
    let flag_ = 0;
    data.forEach(function(element, index) {
        let ts_date_one = new Date(element.sessionStartDate + " " + element.sessionStartTime).getTime();
        if (ts_date_one < ((new Date).getTime()))
            flag_ = 1;
    });
    if (flag_ === 1)
        return false;
    else
        return true;
}

let validate = (input, props, type) => {
    let error = "";
    for (var k in props) {
        if (props.hasOwnProperty(k)) {
            let inputName = k;
            let validationData = props[k];;
            if (!utils.empty(validationData)) {
                var validationFunction = validationData[0] || notEmpty;
                var errorMessage = validationData[1] || "Please enter input.";
                var options = validationData[2];
                var defaultValue = validationData[3];
                if (!validator[validationFunction](input[inputName], options)) {
                    if (!utils.isDefined(defaultValue)) {
                        error = errorMessage;
                        break;
                    }
                }
            }
        }
    }
    return error;
}

module.exports = {
    validate: validate,
};
