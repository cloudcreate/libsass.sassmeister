desc 'Update bower packages. Use this in place of `bower update`'
task "update" do
  require 'yaml'
  require 'json'
  require 'thor'

  class Utilities < Thor
    include Thor::Actions
  end

  utilities = Utilities.new

  plugins = YAML.load_file("config/plugins.yml")
  bower = JSON.parse(`bower list -jq`.chomp!)['dependencies']
  extensions = {}

  plugins.each do |plugin, info|
    if ! bower.keys.include?(info[:bower])
      puts "Adding Bower package: #{info[:bower]}..."

      puts `bower install #{info[:bower]}`
    end
  end

  puts `bower update`

  plugins.sort.each do |plugin, info|
    version = `bower info #{info[:bower]} version -jq`.chomp!
    version.gsub!(/"/, '') unless version.nil?

    homepage = `bower info #{info[:bower]} homepage -jq`.chomp!
    homepage.gsub!(/"/, '') unless homepage.nil?

    if version.nil?
      version = JSON.parse(File.read("sass_modules/#{info[:bower]}/.bower.json"))["_release"]
    end

    extensions[plugin] = {}

    extensions[plugin].merge!({
      bower: info[:bower], 
      paths: info[:paths],
      version: version, 
      import: info[:import], 
      fingerprint: info[:fingerprint], 
      homepage: homepage
    })

  end

  utilities.create_file 'config/extensions.json', extensions.to_json.to_s, {force: true}
end



