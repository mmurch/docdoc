define([
  // Application.
  "app",

  "modules/src"
],

function(app, Src) {

  // Defining the application router, you can attach sub routers here.
  var Router = Backbone.Router.extend({
    routes: {
      "": "index",
      "docco": "docco"
    },

    index: function() {
      app.useLayout('main').render();
    },

    docco: function(){
      app.useLayout('main');

      this.modules.fetch();
    },

    initialize: function() {

      this.modules = new Src.ModuleList();

      // Use main layout and set Views.
      app.useLayout('main');
      
      app.layout.setViews({
        '.doccoNav': new Src.Views.ModuleList({
          collection: this.modules
        }),
        '.doccoHeader': new Src.Views.ContentHeader(),
        '.doccoContent': new Src.Views.Content()
      });
    }

  });

  return Router;

});
