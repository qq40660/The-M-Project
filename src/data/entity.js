// Project:   The M-Project - Mobile HTML5 Application Framework
// Copyright: (c) 2013 M-Way Solutions GmbH. All rights reserved.
//            (c) 2013 panacoda GmbH. All rights reserved.
// Creator:   Frank
// Date:      13.04.2013
// License:   Dual licensed under the MIT or GPL Version 2 licenses.
//            http://github.com/mwaylabs/The-M-Project/blob/master/MIT-LICENSE
//            http://github.com/mwaylabs/The-M-Project/blob/master/GPL-LICENSE
// ==========================================================================

M.Entity = function (options) {
    var fields = this.fields;
    this.fields = {};
    this._mergeFields(fields);
    options = options || {};
    if (options.fields) {
        this._mergeFields(options.fields);
    }
    this.typeMapping = options.typeMapping || this.typeMapping;
    this.collection = options.collection || this.collection;
    var model = options.model || (this.collection ? this.collection.prototype.model : null);
    this.idAttribute = options.idAttribute || this.idAttribute || (model ? model.prototype.idAttribute : '');
    this._updateFields(this.typeMapping);
    this.initialize.apply(this, arguments);
};

M.Entity.from = function (entity, options) {
    // is not an instance of M.Entity
    if (!M.Entity.prototype.isPrototypeOf(entity)) {
        // if this is a prototype of an entity, create an instance
        if (_.isFunction(entity) &&
            M.Entity.prototype.isPrototypeOf(entity.prototype)) {
            var Entity = entity;
            entity = new Entity(options);
        } else {
            if (typeof entity === 'string') {
                entity = {
                    name: entity
                };
            }
            // if this is just a config create a new Entity
            var E = M.Entity.extend(entity);
            entity = new E(options);
        }
    } else if (options && options.typeMapping) {
        entity._updateFields(options.typeMapping);
    }
    return entity;
};

M.Entity.extend = M.extend;
M.Entity.create = M.create;
M.Entity.design = M.design;

_.extend(M.Entity.prototype, M.Object, {

    /**
     * The type of this object.
     *
     * @type String
     */
    _type: 'M.Entity',

    name: '',

    idAttribute: '',

    collection: null,

    model: null,

    fields: {},

    initialize: function () {
    },

    getFields: function () {
        return this.fields;
    },

    getField: function (fieldKey) {
        return this.fields[fieldKey];
    },

    getFieldName: function (fieldKey) {
        var field = this.getField(fieldKey);
        return field && field.name ? field.name : fieldKey;
    },

    getKey: function () {
        return this.idAttribute || M.Model.idAttribute;
    },

    getKeys: function () {
        return this.splitKey(this.getKey());
    },

    /**
     * Splits a comma separated list of keys to a key array
     *
     * @returns {Array} array of keys
     */
    splitKey: function (key) {
        var keys = [];
        if (_.isString(key)) {
            _.each(key.split(','), function (key) {
                var k = key.trim();
                if (k) {
                    keys.push(k);
                }
            });
        }
        return keys;
    },

    _mergeFields: function (newFields) {
        if (!_.isObject(this.fields)) {
            this.fields = {};
        }
        var that = this;
        if (_.isObject(newFields)) {
            _.each(newFields, function (value, key) {
                if (!that.fields[key]) {
                    that.fields[key] = new M.Field(value);
                } else {
                    that.fields[key].merge(value);
                }
            });
        }
    },

    _updateFields: function (typeMapping) {
        var that = this;
        _.each(this.fields, function (value, key) {
            // remove unused properties
            if (value.persistent === NO) {
                delete that.fields[key];
            } else {
                // add missing names
                if (!value.name) {
                    value.name = key;
                }
                // apply default type conversions
                if (typeMapping && typeMapping[value.type]) {
                    value.type = typeMapping[value.type];
                }
            }
        });
    },

    toAttributes: function (data, id, fields) {
        fields = fields || this.fields;
        if (data && !_.isEmpty(fields)) {
            // map field names
            var value, attributes = {};
            _.each(fields, function (field, key) {
                value = _.isFunction(data.get) ? data.get(field.name) : data[field.name];
                attributes[key] = value;
            });
            return attributes;
        }
        return data;
    },

    fromAttributes: function (attrs, fields) {
        fields = fields || this.fields;
        if (attrs && !_.isEmpty(fields)) {
            var data = {};
            _.each(fields, function (field, key) {
                var value = _.isFunction(attrs.get) ? attrs.get(key) : attrs[key];
                value = field.transform(value);
                if (!_.isUndefined(value)) {
                    data[field.name] = value;
                }
            });
            return data;
        }
        return attrs;
    },

    setId: function (attrs, id) {
        if (attrs && id) {
            var key = this.getKey() || attrs.idAttribute;
            if (key) {
                // TODO fix jshint warning
                /*jshint -W030*/
                _.isFunction(attrs.set) ? attrs.set(key, id) : (attrs[key] = id);
                /*jshint -W030*/

            }
        }
        return attrs;
    },

    getId: function (attrs) {
        if (attrs) {
            var key = this.getKey() || attrs.idAttribute;
            if (key) {
                return _.isFunction(attrs.get) ? attrs.get(key) : attrs[key];
            }
        }
    }
});
