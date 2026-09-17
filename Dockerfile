# CardKit build environment.
#
# The stylesheet build (compass/sass) requires Ruby and the JS build requires
# Node. Debian bullseye ships Ruby 2.7, the last Ruby line that reliably
# installs the 2013-era compass toolchain; Node 20 is the LTS pinned in
# .nvmrc and used by CI.
FROM node:20-bullseye

# Ruby 2.7 + bundler + build tools for native gem extensions
RUN apt-get update \
    && apt-get install -y --no-install-recommends ruby-full bundler build-essential \
    && rm -rf /var/lib/apt/lists/*

# Global tooling used by the build
RUN npm install -g bower grunt-cli

WORKDIR /app

# Ruby dependencies. The committed Gemfile.lock pins 2013-era gems against a
# defunct mirror, so resolve fresh against rubygems.org.
COPY Gemfile ./
RUN bundle install

# Node dependencies (reproducible via the committed lockfile).
# --ignore-scripts: the 2013-era imagemin toolchain (jpegtran-bin /
# optipng-bin) runs postinstall scripts that crash on modern Node. The
# `grunt imagemin` step therefore needs the binaries installed separately;
# see README "Building with Docker" for the caveat.
COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts

# Bower dependencies
COPY bower.json ./
RUN bower install --allow-root --config.interactive=false

# Source
COPY . .

CMD ["grunt"]