from django.views.generic import TemplateView


class IndexView(TemplateView):
    """The single page that mounts the React app."""

    template_name = 'web/index.html'
