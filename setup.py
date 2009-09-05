from setuptools import setup, find_packages
import os

version = '1.0'

setup(name='fa.jquery',
      version=version,
      description="jQuery widgets for formalchemy",
      long_description=open("README.txt").read(),
      # Get more strings from http://www.python.org/pypi?%3Aaction=list_classifiers
      classifiers=[
        "Programming Language :: Python",
        "Topic :: Software Development :: Libraries :: Python Modules",
        ],
      keywords='jquery ajax widgets',
      author='Gael Pasgrimaud',
      author_email='gael@gawel.org',
      url='http://www.gawel.org/docs/fa.jquery/index.html',
      license='MIT',
      packages=find_packages(exclude=['ez_setup']),
      namespace_packages=['fa'],
      include_package_data=True,
      zip_safe=False,
      install_requires=[
          'setuptools',
          'FormAlchemy>=1.2.3',
          'simplejson',
          'mako',
      ],
      entry_points="""
      [paste.app_factory]
      main = fa.jquery.wsgi:StaticApp
      test = fa.jquery.app:make_app
      """,
      )