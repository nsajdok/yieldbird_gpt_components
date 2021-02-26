function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);

function loadScript(scriptUrl) {
  var googleScriptTag = document.createElement('script');
  googleScriptTag.src = "" + scriptUrl;
  googleScriptTag.async = true;
  googleScriptTag.type = 'text/javascript';
  document.getElementsByTagName('head')[0].appendChild(googleScriptTag);
}

function ensureScripts() {
  if (typeof window !== 'undefined') {
    window.googletag = window.googletag || {};
    window.googletag.cmd = window.googletag.cmd || [];
    window.Yieldbird = window.Yieldbird || {};
    window.Yieldbird.cmd = window.Yieldbird.cmd || [];
  }
}
function initializeAdStack(uuid) {
  if (typeof window !== 'undefined') {
    ensureScripts();
    window.yb_configuration = {
      lazyLoad: true
    };
    window.googletag.cmd.push(function () {
      window.googletag.pubads().disableInitialLoad();
    });

    if (Object.keys(window.googletag).length <= 1) {
      loadScript(document.location.protocol + "//securepubads.g.doubleclick.net/tag/js/gpt.js");
    }

    if (Object.keys(window.Yieldbird).length <= 1) {
      loadScript(document.location.protocol + "//jscdn.yieldbird.com/" + uuid + "/yb.js");
    }
  }
}

var AdManager = /*#__PURE__*/function () {
  function AdManager(timeout) {
    if (timeout === void 0) {
      timeout = 1000;
    }

    this.adsToRefresh = {};
    this.interval = null;
    this.timeout = timeout;
    ensureScripts();
  }

  AdManager.defineSlot = function defineSlot(adUnitPath, size, optDiv, shouldRefreshAds, sizeMapping, targeting) {
    var _this = this;

    return new Promise(function (resolve, reject) {
      if (typeof window !== 'undefined') {
        window.Yieldbird.cmd.push(function () {
          window.googletag.cmd.push(function () {
            var slot = _this.createSlot(adUnitPath, size, optDiv);

            _this.setTargeting(slot, targeting);

            _this.setSizeMapping(slot, sizeMapping);

            if (!shouldRefreshAds) {
              window.Yieldbird.setGPTTargeting([slot]);
              window.googletag.enableServices();
              window.googletag.display(optDiv);
              window.googletag.pubads().refresh([slot]);
            }

            slot ? resolve(slot) : reject(new Error('Slot could not be created.'));
          });
        });
      } else {
        reject(new Error('Slot could not be created.'));
      }
    });
  };

  AdManager.destroySlot = function destroySlot(optDiv) {
    if (typeof window !== 'undefined') {
      window.googletag.cmd.push(function () {
        var slot = window.googletag.pubads().getSlots().find(function (el) {
          return el.getSlotElementId() === optDiv;
        });
        slot && window.googletag.destroySlots([slot]);
      });
    }
  };

  var _proto = AdManager.prototype;

  _proto.refreshSlot = function refreshSlot(slot, optDiv) {
    var _this2 = this;

    if (typeof window !== 'undefined') {
      this.adsToRefresh[optDiv] = slot;
      console.log('RefreshSlot', slot);
      this.interval && window.clearInterval(this.interval);
      this.interval = window.setTimeout(function () {
        var slots = Object.keys(_this2.adsToRefresh).map(function (el) {
          return _this2.adsToRefresh[el];
        });

        if (slots.length > 0) {
          window.Yieldbird.cmd.push(function () {
            window.Yieldbird.refresh(slots);
            _this2.adsToRefresh = {};
          });
        }
      }, this.timeout, true);
    }
  };

  AdManager.createSlot = function createSlot(adUnitPath, size, optDiv) {
    var slot = window.googletag.pubads().getSlots().find(function (el) {
      return el.getSlotElementId() === optDiv;
    });
    slot = slot || window.googletag.defineSlot(adUnitPath, size, optDiv).addService(window.googletag.pubads());
    slot.clearTargeting();
    return slot;
  };

  AdManager.setTargeting = function setTargeting(slot, targeting) {
    if (slot && targeting) {
      Object.keys(targeting).forEach(function (targetingKey) {
        slot.setTargeting(targetingKey, targeting[targetingKey]);
      });
    }
  };

  AdManager.setSizeMapping = function setSizeMapping(slot, sizeMapping) {
    if (sizeMapping) {
      var sizeMappingBuilder = window.googletag.sizeMapping();
      sizeMapping.forEach(function (sizeMap) {
        sizeMappingBuilder.addSize(sizeMap[0], sizeMap[1]);
      });
      slot.defineSizeMapping(sizeMappingBuilder.build());
    }
  };

  return AdManager;
}();

var AdManagerContext = React__default.createContext({
  shouldRefresh: function shouldRefresh(_optDiv) {
    return false;
  },
  refreshAd: function refreshAd(_slot, _optDiv) {},
  registerSlot: function registerSlot(_slot) {}
});
var AdManagerProvider = function AdManagerProvider(_ref) {
  var children = _ref.children,
      uuid = _ref.uuid,
      refreshDelay = _ref.refreshDelay;
  var adManager = new AdManager(refreshDelay);

  var _useState = React.useState([]),
      adsMap = _useState[0],
      setAdsMap = _useState[1];

  var registerSlot = React.useCallback(function (slot) {
    adsMap.push(slot.getSlotElementId());
    setAdsMap(adsMap);
  }, [adsMap, setAdsMap]);
  var refreshAd = React.useCallback(function (slot, optDiv) {
    adManager.refreshSlot(slot, optDiv);
  }, [adManager]);
  var shouldRefresh = React.useCallback(function (optDiv) {
    return adsMap.includes(optDiv);
  }, adsMap);
  React.useEffect(function () {
    initializeAdStack(uuid);
  }, [uuid]);
  return React__default.createElement(AdManagerContext.Provider, {
    value: {
      refreshAd: refreshAd,
      registerSlot: registerSlot,
      shouldRefresh: shouldRefresh
    }
  }, children);
};

var AdManagerSlot = function AdManagerSlot(_ref) {
  var adUnitPath = _ref.adUnitPath,
      className = _ref.className,
      size = _ref.size,
      optDiv = _ref.optDiv,
      sizeMapping = _ref.sizeMapping,
      targeting = _ref.targeting;
  var adManagerContext = React.useContext(AdManagerContext);
  React.useEffect(function () {
    var refresh = adManagerContext.shouldRefresh(optDiv);
    console.log(refresh, adManagerContext);
    AdManager.defineSlot(adUnitPath, size, optDiv, refresh, sizeMapping, targeting).then(function (slot) {
      adManagerContext.registerSlot(slot);
      refresh && adManagerContext.refreshAd(slot, optDiv);
    })["catch"](function (e) {
      console.error(e);
    });
    return function () {
      AdManager.destroySlot(optDiv);
    };
  }, [adManagerContext]);
  return React__default.createElement("div", {
    id: optDiv,
    className: className
  });
};

exports.AdManagerContext = AdManagerContext;
exports.AdManagerProvider = AdManagerProvider;
exports.AdManagerSlot = AdManagerSlot;
//# sourceMappingURL=index.js.map
