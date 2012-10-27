const cm = require("context-menu"),
      data = require("self").data,
      pb = require("private-browsing"),
      tabs = require("tabs");

var menuitems = [];

var url_to_open = '';

var remove_items = function() {
    for (var i in menuitems) {
        menuitems[i].destroy();
    }
    menuitems = [];
}

var prepare_open_menu = function() {
    remove_items();

    var open_link_item = cm.Item({
        label: "Abrir link en Modo Privado",
        image: data.url("img/privacy-link16.png"),
        context: cm.SelectorContext("a[href]"),
        contentScriptFile: data.url("js/cm-openlink.js"),
        onMessage: function(src) {
            url_to_open = src;
            pb.activate();
        }
    });
    menuitems.push(open_link_item);

    var open_private_item = cm.Item({
        label: "Abrir Modo Privado",
        image: data.url("img/privacy16.png"),
        contentScript: 'self.on("click", self.postMessage)',
        onMessage: function() {
            pb.activate();
        }
    });
    menuitems.push(open_private_item);
};

var prepare_close_menu = function() {
    remove_items();

    var close_item = cm.Item({
        label: "Salir del Modo Privado",
        image: data.url("img/privacy16.png"),
        contentScript: 'self.on("click", self.postMessage)',
        onMessage: function() {
            pb.deactivate();
        }
    });
    menuitems.push(close_item);
};


exports.main = function(options, callbacks) {
    pb.on('start', function() {
        prepare_close_menu(); 

        if (!url_to_open) return;
        tabs.activeTab.url = url_to_open;
        url_to_open = ''; 
    });
    pb.on('stop', prepare_open_menu);

    if (!pb.isActive) prepare_open_menu(); else prepare_close_menu();
};
