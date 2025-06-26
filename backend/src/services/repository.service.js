/**
 * Save new object
 * @param body
 * @returns {Promise<any>}
 */
module.exports.save = (body) =>
    new Promise((resolve, reject) => {
      body
        .save()
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  
  /**
   * Save new object with Session
   * @param body
   * @returns {Promise<any>}
   */
  module.exports.saveWithSession = (body, session) =>
    new Promise((resolve, reject) => {
      body
        .save({ session })
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  
  /**
   * Find a object
   * @param model
   * @param query
   * @param projection
   * @returns {Promise<any>}
   */
  module.exports.findOne = (model, query, projection) =>
    new Promise((resolve, reject) => {
      model
        .findOne(query, projection)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  
  /**
   * Find many objects
   * @param model
   * @param query
   * @param projection
   * @param options
   * @returns {Promise<[]>}
   */
  module.exports.findMany = (model, query, projection, options) =>
    new Promise((resolve, reject) => {
      model
        .find(query, projection, options)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  
  /**
   * Find objects by aggregate query
   * @param model
   * @param query
   * @returns {Promise<unknown>}
   */
  module.exports.findByAggregateQuery = (model, query) =>
    new Promise((resolve, reject) => {
      model
        .aggregate(query)
        .allowDiskUse(true)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  
  /**
   * Find objects by aggregate query
   * @param model
   * @param query
   * @returns {Promise<unknown>}
   */
  module.exports.findByAggregateQueryWithSession = (model, query, session) =>
    new Promise((resolve, reject) => {
      model
        .aggregate(query)
        .option({ session: session })
        .allowDiskUse(true)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  
  /**
   * Update one object
   * @param model
   * @param query
   * @param body
   * @param options
   * @returns {Promise<unknown>}
   */
  module.exports.updateOne = (model, query, body, options) =>
    new Promise((resolve, reject) => {
      model
        .findOneAndUpdate(query, body, options)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  
  /**
   * Update many objects
   * @param model
   * @param query
   * @param body
   * @param options
   * @returns {Promise<unknown>}
   */
  module.exports.updateMany = (model, query, body, options) =>
    new Promise((resolve, reject) => {
      model
        .updateMany(query, body, options)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  
  /**
   * Count documents
   * @param model
   * @param query
   * @param options
   * @returns {Promise<unknown>}
   */
  module.exports.countDocuments = (model, query, options) =>
    new Promise((resolve, reject) => {
      model
        .countDocuments(query, options)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  
  /**
   * insert many objects
   * @param model
   * @param body
   * @param options
   * @returns {Promise<unknown>}
   */
  module.exports.insertMany = (model, body, options) =>
    new Promise((resolve, reject) => {
      model
        .insertMany(body, options)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  
  /**
   * delete single record
   * @param {*} model
   * @param {*} query
   * @param {*} options
   * @returns
   */
  module.exports.deleteOne = (model, query, options) =>
    new Promise((resolve, reject) => {
      model
        .findOneAndDelete(query, options)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  
  /**
   * delete multiple records
   * @param {*} model
   * @param {*} query
   * @param {*} options
   * @returns
   */
  module.exports.deleteMany = (model, query, options) =>
    new Promise((resolve, reject) => {
      model
        .deleteMany(query, options)
        .then((data) => {
          resolve(data);
        })
        .catch((err) => {
          reject(err);
        });
    });
  