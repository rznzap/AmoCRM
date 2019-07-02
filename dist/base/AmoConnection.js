'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _apiUrls = require('../apiUrls.js');

var _apiUrls2 = _interopRequireDefault(_apiUrls);

var _EventResource2 = require('./EventResource');

var _EventResource3 = _interopRequireDefault(_EventResource2);

var _helpers = require('../helpers');

var _PrivateDomainRequest = require('./requests/domain/PrivateDomainRequest');

var _PrivateDomainRequest2 = _interopRequireDefault(_PrivateDomainRequest);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var AmoConnection = function (_EventResource) {
  _inherits(AmoConnection, _EventResource);

  function AmoConnection() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, AmoConnection);

    var _this = _possibleConstructorReturn(this, (AmoConnection.__proto__ || Object.getPrototypeOf(AmoConnection)).call(this));

    _this._request = new _PrivateDomainRequest2.default(options.domain);
    _this._options = options.auth;
    _this._isConnected = false;
    return _this;
  }

  _createClass(AmoConnection, [{
    key: 'disconnect',
    value: function disconnect() {
      this._request.clear();
      this._isConnected = false;

      this.triggerEvent('disconnected', true);
    }
  }, {
    key: 'connectIfNeeded',
    value: function connectIfNeeded() {

      if (!this._isConnected) {
        return this.connect();
      }

      this.triggerEvent('checkReconnect', true);

      var SESSION_LIFETIME = this.constructor.SESSION_LIFETIME,
          sessionExpiresAt = +this._lastRequestAt + SESSION_LIFETIME,
          now = new Date();


      if (now > sessionExpiresAt) {
        return this.reconnect();
      }

      if (this._request.expires && now > this._request.expires) {
        return this.reconnect();
      }

      return Promise.resolve();
    }
  }, {
    key: 'request',
    value: function () {
      var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
        var _request;

        var _args = arguments;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return this.connectIfNeeded();

              case 2:
                this._lastRequestAt = new Date();
                _context.next = 5;
                return (_request = this._request).request.apply(_request, _args);

              case 5:
                return _context.abrupt('return', _context.sent);

              case 6:
              case 'end':
                return _context.stop();
            }
          }
        }, _callee, this);
      }));

      function request() {
        return _ref.apply(this, arguments);
      }

      return request;
    }()
  }, {
    key: 'reconnect',
    value: function reconnect() {
      this._isConnected = false;
      this.triggerEvent('beforeReconnect', true);
      return this.connect();
    }
  }, {
    key: 'connect',
    value: function connect() {
      var _this2 = this;

      if (this._isConnected) {
        return Promise.resolve(true);
      }
      var _options = this._options,
          login = _options.login,
          hash = _options.hash,
          data = {
        USER_LOGIN: login,
        USER_HASH: hash
      };


      this.triggerEvent('beforeConnect', this);

      this._lastConnectionRequestAt = new Date();
      return this._request.post(_apiUrls2.default.auth, data, {
        headers: { 'Content-Type': 'application/json' },
        response: {
          saveCookies: true,
          dataType: 'json'
        }
      }).then(function (data) {
        if (data && data.response && data.response.auth) {
          _this2._isConnected = data.response.auth === true;
        }

        if (_this2._isConnected) {
          _this2._lastRequestAt = new Date();
          _this2.triggerEvent('connected', _this2);
          return true;
        }

        var e = new Error('Auth Error');
        e.data = data.response;

        _this2.triggerEvent('authError', e, _this2);
        _this2.triggerEvent('error', e, _this2);

        return Promise.reject(e);
      });
    }
  }, {
    key: 'connected',
    get: function get() {
      return this._isConnected;
    }
  }]);

  return AmoConnection;
}(_EventResource3.default);

AmoConnection.EVENTS = ['beforeReconnect', 'beforeConnect', 'checkReconnect', 'authError', 'connected', 'disconnected', 'error'];
AmoConnection.SESSION_LIFETIME = 15 * 60 * 1000;

module.exports = AmoConnection;