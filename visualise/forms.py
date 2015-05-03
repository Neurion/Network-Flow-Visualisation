from django import forms

class TestForm(forms.Form):
	test = forms.CharField(label='Test', max_length=10)

class FilterForm(forms.Form):
	# filter_form is the "name" attribute of the HTML element
	filter_form = forms.CharField(label='Test', max_length=10)

	CHOICES=[('select1','Daily'),
			('select2','Weekly'),
			('select3','Monthly'),
			]	
	timeline = forms.ChoiceField(choices=CHOICES, widget=forms.RadioSelect())