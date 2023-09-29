mapboxgl.accessToken =
  "pk.eyJ1IjoiamFtZXNwb3J0ZXIyMSIsImEiOiJjbGxvN2lmazcwN3d4M2NuM2pnZHZsZTNwIn0.I70dWocAUtgPwOThih14DA";

var filterGroup = document.getElementById("ll");

var maxBounds = [
  [-74.27, 40.49], // Southwest coordinates
  [-73.68, 40.92], // Northeast coordinates
];

var map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/jamesporter21/clmx29w1a00wu01qneco67iyw",
  center: [-96.7853964, 32.7846839],
  zoom: 10,
  // maxBounds: maxBounds,
  preserveDrawingBuffer: true,
  customAttribution:
    'created by <a style="padding: 0 3px 0 3px; color:#FFFFFF; background-color: #bf7f46;" target="_blank" href=http://www.geocadder.bg/en/portfolio.html>GEOCADDER</a>',
});

var nav = new mapboxgl.NavigationControl({ showCompass: false });
map.addControl(nav, "top-left");

var markersAllIds = [];

var onlySelectedaccessibilityPoints = [];
var isinitialSelectedType = false;
var initialSelectedType = "";
var counter = 0;

var mainPointLatitude;
var mainPointLongitude;

var pointsForSearchArray = [];

var popup = new mapboxgl.Popup({
  closeButton: false,
});

map.on("load", () => {
  /// loading POIs data from Google Sheets table///
  $.getJSON(
    "https://sheets.googleapis.com/v4/spreadsheets/1SLtDR6js3Tf6e64iqDalmUI6NXg01SB-AZBpjmRB1OE/values/Sheet1!C2:N3000?majorDimension=ROWS&key=AIzaSyB-2fHh4Fu0Gw92XtN8U724FH1zoy5xWhs",
    function (response) {
      response.values.forEach(function (marker) {
        var campusName = marker[0];
        var zipCode = marker[1];
        var address = marker[2];

        var latitude = parseFloat(marker[3]);
        var longitude = parseFloat(marker[4]);

        var districtCharterOperator = marker[6];
        var gradespan = marker[7];
        var accountabilityScore = marker[8];
        var accountabilityGrade = marker[9];
        var studentAchievementScore = marker[10];
        var studentAchievementGrade = marker[11];

        var firstFilterCheckboxValue = studentAchievementGrade
          .toLowerCase()
          .replace(/\s/g, "-");

        var secondFilterCheckboxValue = studentAchievementGrade
          .toLowerCase()
          .replace(/\s/g, "-");

        var type = marker[5];
        var schoolType = "";
        if (type === "TRUE") {
          schoolType = "Charter";
        } else {
          schoolType = "DISD School";
        }

        var popupContent = "<div>";

        popupContent += "<div class='title'>" + campusName + "</div>";

        popupContent += "<hr>";

        popupContent += "<div class='details'>";

        popupContent += "<div>Address: <b>" + address + "</b></div>";
        popupContent += "<div>Charter: <b>" + schoolType + "</b></div>";
        popupContent +=
          "<div>District/Charter Operator Name: <b>" +
          districtCharterOperator +
          "</b></div>";
        popupContent += "<div>Gradespan: <b>" + gradespan + "</b></div>";

        popupContent +=
          "<div>2022 Accountability Score: <b>" +
          accountabilityScore +
          "</b></div>";
        popupContent +=
          "<div>2022 Accountability Grade: <b>" +
          accountabilityGrade +
          "</b></div>";
        popupContent +=
          "<div>2022 Student Achievement Score: <b>" +
          studentAchievementScore +
          "</b></div>";
        popupContent +=
          "<div>2022 Student Achievement Grade: <b>" +
          studentAchievementGrade +
          "</b></div>";

        popupContent += "</div>";

        popupContent += "</div>";

        popup = new mapboxgl.Popup({
          closeButton: false,
          closeOnClick: false,
        }).setHTML(popupContent);

        var el = document.createElement("div");

        var schoolTypeSmallLetters = schoolType
          .toLowerCase()
          .replace(/\s/g, "-");
        el.className = "marker " + schoolTypeSmallLetters;
        el.id = type;

        var markerObj = new mapboxgl.Marker(el)
          .setLngLat([longitude, latitude])
          .setPopup(popup)
          .addTo(map);

        // const markerDiv = markerObj.getElement();

        if (type === "TRUE") {
          $(el).attr("data-first-type", "first-" + firstFilterCheckboxValue);
          $(el).attr("data-first-type-visible", "true");
        } else {
          $(el).attr("data-second-type", "second-" + secondFilterCheckboxValue);
          $(el).attr("data-second-type-visible", "true");
        }

        $(el).attr("data-zip-code", zipCode);
        $(el).attr("data-zip-code-visible", "false");

        el.style.backgroundImage = "url(" + schoolTypeSmallLetters + ".svg)";
        el.style.backgroundColor = "#FFFFFF";
        el.style.border =
          "2px solid " + getIconBorderColorByType(schoolTypeSmallLetters);

        el.style.display = "none";

        markersAllIds.push({
          schoolTypeSmallLetters: schoolTypeSmallLetters,
          type: type,
          schoolType: schoolType,
        });
        // }

        if (campusName) {
          pointsForSearchArray.push({
            campusName: campusName,
            schoolType: schoolType,
            latitude: latitude,
            longitude: longitude,
            type: type,
          });
        }
      });

      // map.fitBounds(bounds, { padding: 80 });

      var objectsJson = markersAllIds.map((object) => JSON.stringify(object));
      var objectsJsonSet = new Set(objectsJson);
      var uniqueJsonArray = Array.from(objectsJsonSet);
      var uniqueObjectsByContent = uniqueJsonArray.map((string) =>
        JSON.parse(string)
      );

      // close all opened popups
      $(".marker").click(function () {
        $(".mapboxgl-popup").remove();
      });

      $(".mapboxgl-canvas").click(function () {
        $(".mapboxgl-popup").remove();
      });

      // map.fitBounds(bounds, { padding: 80 });
    }
  );

  // popup toggling //
  function togglePopup() {
    var popup = this._popup;

    if (!popup) return;
    else if (popup.isOpen()) popup.remove();
    else popup.addTo(this._map);
  }
  // end popup toggling//

  function getIconBorderColorByType(type) {
    var color = "red";
    switch (type) {
      case "disd-school":
        color = "red";
        break;
      case "charter":
        color = "blue";
        break;

      default:
        color = "green";
    }
    return color;
  }

  // map.on("click", (event) => {
  //   const features = map.queryRenderedFeatures(event.point, {
  //     layers: ["all-91b1l6"],
  //   });
  //   if (!features.length) {
  //     return;
  //   }
  //   const feature = features[0];
  //   console.log(feature);
  // });

  // map.on("click", function () {
  //   console.log(map.getZoom());
  // });

  map.addSource("counties", {
    type: "vector",
    url: "mapbox://jamesporter21.buznx3hr",
    promoteId: { "all-91b1l6": "name" },
  });

  map.addLayer({
    id: "ACTIVE BLOCKS",
    type: "fill",
    "source-layer": "all-91b1l6",
    source: "counties",
    layout: {},
    paint: {
      "fill-color":
        // ["get", "color"],
        [
          "case",
          ["==", ["feature-state", "numUsers"], 2],
          "rgba(255, 0, 0, 0.0)",
          // ["get", "color"],
          "#9B111E",
        ],
      "fill-opacity": 0.3,
    },
  });

  map.addLayer({
    id: "boxes-outline-layer",
    type: "line",
    visibility: "visible",
    "source-layer": "all-91b1l6",
    source: "counties",
    layout: {},
    paint: {
      "line-color": "red",
      // "#ffffff",
      // [
      //   "case",
      //   ["==", ["feature-state", "numUsers"], 2],
      //   "rgba(255, 0, 0, 0.0)",
      //   ["get", "color"],
      // ],
      "line-width": 1,
    },
  });

  var zipsArray = [
    75217, 75216, 75232, 75220, 75227, 75203, 75212, 75228, 75244, 75241, 75253,
    75215, 75204, 75224, 75231, 75211, 75237, 75223, 75159, 75201, 75233, 75218,
    75238, 75229, 75235, 75226, 75210, 75202, 75209, 75219, 75205, 75001, 75006,
    75115, 75150, 75172, 75206, 75208, 75214, 75230, 75234, 75236, 75246, 75254,
  ];
  zipsArray.forEach(function (zipCode) {
    map.setFeatureState(
      { id: zipCode, source: "counties", sourceLayer: "all-91b1l6" },
      { numUsers: 2 }
    );
  });

  map.on("mouseenter", "ACTIVE BLOCKS", function (e) {
    // Change the cursor style as a UI indicator.
    map.getCanvas().style.cursor = "pointer";

    // Single out the first found feature.
    var feature = e.features[0];

    // Display a popup with the name of the county
    popup.setLngLat(e.lngLat).setText(feature.properties.name).addTo(map);
  });

  map.on("mouseleave", "ACTIVE BLOCKS", function () {
    map.getCanvas().style.cursor = "";
    popup.remove();
  });

  // Add DISD boundary
  map.addSource("disd-boundary", {
    type: "vector",
    url: "mapbox://jamesporter21.66qhulir",
    promoteId: { "disd-border-a2c95i": "layer" },
  });

  map.addLayer({
    id: "disd-outline-layer",
    type: "line",
    visibility: "visible",
    "source-layer": "disd-border-a2c95i",
    source: "disd-boundary",
    layout: {},
    paint: {
      "line-color": "#dd1db7",
      "line-width": 2,
    },
  });

  // var zipCodesArray = [];
  // const features = map.queryRenderedFeatures({
  //   layers: ["ACTIVE BLOCKS"],
  // });
  // features.forEach(function (feature) {
  //   console.log(feature.id);
  //   zipCodesArray.push(feature.id);
  // });
});

// popup toggling //
function togglePopup() {
  var popup = this._popup;

  if (!popup) return;
  else if (popup.isOpen()) popup.remove();
  else popup.addTo(this._map);
}
// end popup toggling//

//////////////// open/close dropdown menu for first type filter
var checkList = document.getElementById("list1");
checkList.getElementsByClassName("anchor")[0].onclick = function (evt) {
  if (checkList.classList.contains("visible"))
    checkList.classList.remove("visible");
  else checkList.classList.add("visible");
};
//////////////

//////////////// open/close dropdown menu for third type filter
var checkListTwo = document.getElementById("list2");
checkListTwo.getElementsByClassName("anchor")[0].onclick = function (evt) {
  if (checkListTwo.classList.contains("visible"))
    checkListTwo.classList.remove("visible");
  else checkListTwo.classList.add("visible");
};
//////////////

//////////////// open/close dropdown menu for third type filter
var checkListThree = document.getElementById("list3");
checkListThree.getElementsByClassName("anchor")[0].onclick = function (evt) {
  if (checkListThree.classList.contains("visible"))
    checkListThree.classList.remove("visible");
  else checkListThree.classList.add("visible");
};
//////////////

$("input[type='checkbox'][name='filter-by-first-type-input']").click(
  function () {
    var currentCountry = $(this).val();
    console.log(currentCountry);
    if ($(this).is(":checked")) {
      $("[data-first-type='" + currentCountry + "']").each(function (index) {
        $(this).attr("data-first-type-visible", "true");
        if ($(this).attr("data-zip-code-visible") === "true") {
          $(this).css("display", "block");
        }
      });
    } else {
      $("[data-first-type='" + currentCountry + "']").each(function (index) {
        $(this).attr("data-first-type-visible", "false");
        $(this).css("display", "none");
      });
    }
  }
);

$("input[type='checkbox'][name='filter-by-second-type-input']").click(
  function () {
    var currentCountry = $(this).val();
    if ($(this).is(":checked")) {
      $("[data-second-type='" + currentCountry + "']").each(function (index) {
        $(this).attr("data-second-type-visible", "true");
        if ($(this).attr("data-zip-code-visible") === "true") {
          $(this).css("display", "block");
        }
      });
    } else {
      $("[data-second-type='" + currentCountry + "']").each(function (index) {
        $(this).attr("data-second-type-visible", "false");
        $(this).css("display", "none");
      });
    }
  }
);

$("input[type='checkbox'][name='filter-by-third-type-input']").click(
  function () {
    var currentCountry = $(this).val();
    if ($(this).is(":checked")) {
      if (currentCountry === "all") {
        $("input[type='checkbox'][name='filter-by-third-type-input']").each(
          function () {
            $(this).prop("checked", true);
          }
        );

        var zipsArray = [
          75217, 75216, 75232, 75220, 75227, 75203, 75212, 75228, 75244, 75241,
          75253, 75215, 75204, 75224, 75231, 75211, 75237, 75223, 75159, 75201,
          75233, 75218, 75238, 75229, 75235, 75226, 75210, 75202, 75209, 75219,
          75205, 75001, 75006, 75115, 75150, 75172, 75206, 75208, 75214, 75230,
          75234, 75236, 75246, 75254,
        ];
        zipsArray.forEach(function (zipCode) {
          // zip codes polygons
          map.setFeatureState(
            { id: zipCode, source: "counties", sourceLayer: "all-91b1l6" },
            { numUsers: 1 }
          );
          // points with this zip code
          $("[data-zip-code='" + zipCode + "']").each(function (index) {
            $(this).attr("data-zip-code-visible", "true");
            if (
              $(this).attr("data-zip-code-visible") === "true" &&
              $(this).attr("data-first-type-visible") === "true"
            ) {
              $(this).css("display", "block");
            }
            if (
              $(this).attr("data-zip-code-visible") === "false" &&
              $(this).attr("data-second-type-visible") === "true"
            ) {
              $(this).css("display", "block");
            }
          });
        });
      } else {
        // zip codes polygons
        map.setFeatureState(
          { id: currentCountry, source: "counties", sourceLayer: "all-91b1l6" },
          { numUsers: 1 }
        );
        // points with this zip code
        $("[data-zip-code='" + currentCountry + "']").each(function (index) {
          $(this).attr("data-zip-code-visible", "true");
          if (
            $(this).attr("data-zip-code-visible") === "true" &&
            $(this).attr("data-first-type-visible") === "true"
          ) {
            $(this).css("display", "block");
          }
          if (
            $(this).attr("data-zip-code-visible") === "false" &&
            $(this).attr("data-second-type-visible") === "true"
          ) {
            $(this).css("display", "block");
          }
        });
      }
    } else {
      if (currentCountry === "all") {
        $("input[type='checkbox'][name='filter-by-third-type-input']").each(
          function () {
            $(this).prop("checked", false);
          }
        );

        var zipsArray = [
          75217, 75216, 75232, 75220, 75227, 75203, 75212, 75228, 75244, 75241,
          75253, 75215, 75204, 75224, 75231, 75211, 75237, 75223, 75159, 75201,
          75233, 75218, 75238, 75229, 75235, 75226, 75210, 75202, 75209, 75219,
          75205, 75001, 75006, 75115, 75150, 75172, 75206, 75208, 75214, 75230,
          75234, 75236, 75246, 75254,
        ];
        zipsArray.forEach(function (zipCode) {
          // zip codes polygons
          map.setFeatureState(
            { id: zipCode, source: "counties", sourceLayer: "all-91b1l6" },
            { numUsers: 2 }
          );
          // points with this zip code
          $("[data-zip-code='" + zipCode + "']").each(function (index) {
            $(this).attr("data-zip-code-visible", "false");
            $(this).css("display", "none");
          });
        });
      } else {
        // zip codes polygons
        map.setFeatureState(
          { id: currentCountry, source: "counties", sourceLayer: "all-91b1l6" },
          { numUsers: 2 }
        );
        // points with this zip code
        $("[data-zip-code='" + currentCountry + "']").each(function (index) {
          $(this).attr("data-zip-code-visible", "false");
          $(this).css("display", "none");
        });
      }
    }
  }
);
