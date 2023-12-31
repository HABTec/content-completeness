/* http://keith-wood.name/calendars.html
   Khmer initialisation for calendars datepicker for jQuery.
   Written by Sovichet Tep (sovichet.tep@gmail.com). */
(function($) {
	$.calendars.picker.regional['km'] = {
		renderer: $.calendars.picker.defaultRenderer,
		prevText: 'ថយ​ក្រោយ', prevStatus: '',
		prevJumpText: '&#x3c;&#x3c;', prevJumpStatus: '',
		nextText: 'ទៅ​មុខ', nextStatus: '',
		nextJumpText: '&#x3e;&#x3e;', nextJumpStatus: '',
		currentText: 'ថ្ងៃ​នេះ', currentStatus: '',
		todayText: 'ថ្ងៃ​នេះ', todayStatus: '',
		clearText: 'X', clearStatus: '',
		closeText: 'រួច​រាល់', closeStatus: '',
		yearStatus: '', monthStatus: '',
		weekText: 'Wk', weekStatus: '',
		dayStatus: 'DD d MM', defaultStatus: '',
		isRTL: false
	};
	$.calendars.picker.setDefaults($.calendars.picker.regional['km']);
})(jQuery);
