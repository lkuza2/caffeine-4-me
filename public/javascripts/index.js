$(document).ready(function() {
  //datepicker
  $('#datepickerDate').datepicker({
    format: 'mm-dd-yyyy'
  });

  $('#datepickerDateComponent').datepicker();

  //timepicker
  $('#timepicker').timepicker({
    minuteStep: 5,
    showSeconds: true,
    showMeridian: false,
    disableFocus: false,
    showWidget: true
  }).focus(function() {
    $(this).next().trigger('click');
  });
});
