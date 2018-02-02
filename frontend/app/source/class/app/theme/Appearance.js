/* ************************************************************************

   Copyright:

   License:

   Authors:

************************************************************************ */

qx.Theme.define("app.theme.Appearance",
{
  extend : qx.theme.indigo.Appearance,

  appearances :
  {
    "group-item" :
      {
        include : "label",
        alias : "label",

        style : function()
        {
          return {
            padding : 4,
            textAlign: "center",
            font: "activity-group",
            decorator: "activity-group"
          };
        }
      },
  }
});