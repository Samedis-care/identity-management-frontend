import os
import json
import re
import sys

SRC_LNG = "en"
TAG_REGEX = re.compile(r"{{(.*?)}}")


def json_to_keys(data):
    results = []
    if type(data) is list:
        for i in range(len(data)):
            result_keys = json_to_keys(data[i])
            if result_keys is None:
                results.append(str(i))
            else:
                for key in result_keys:
                    results.append(str(i) + "." + key)
        return results
    elif type(data) is dict:
        for key, value in data.items():
            result_keys = json_to_keys(value)
            if result_keys is None:
                results.append(key)
            else:
                for result_key in result_keys:
                    results.append(key + "." + result_key)
        return results
    else:
        return None


def get_key_value(data, key: str, org_key=None):
    # given key a.b.c.d => [a, b.c.d]
    # given key a => [a]
    key_split = key.split(".", maxsplit=1)
    if type(data) is list:
        result = data[int(key_split[0])]
    elif type(data) is dict:
        result = data[key_split[0]]
    else:
        raise ValueError('get_key_value expected list or dict, but got value')
    if len(key_split) == 2:
        try:
            return get_key_value(result, key_split[1], org_key or key)
        except KeyError as e:
            # shouldn't happen
            if org_key is None:
                print(e, data, key)
            raise e
    return result


def extract_template_tags(label: str):
    return TAG_REGEX.findall(label)


def validate_namespace(base_dir: str, lang: str, namespace: str):
    errors = []
    src_file = os.path.join(base_dir, SRC_LNG, namespace)
    dst_file = os.path.join(base_dir, lang, namespace)
    with open(src_file) as f:
        src_data = json.load(f)
    with open(dst_file) as f:
        dst_data = json.load(f)
    src_keys = json_to_keys(src_data)
    src_keys.sort()
    dst_keys = json_to_keys(dst_data)
    dst_keys.sort()
    if src_keys != dst_keys:
        missing_keys = [k for k in src_keys if k not in dst_keys]
        additional_keys = [k for k in dst_keys if k not in src_keys]
        error_parts = [f"Lang {lang}, Namespace {namespace}"]
        if len(missing_keys) > 0:
            error_parts.append(f"Missing keys: {', '.join(missing_keys)}")
        if len(additional_keys) > 0:
            error_parts.append(f"Additional keys: {', '.join(additional_keys)}")
        errors.append('; '.join(error_parts))
    for key in src_keys:
        if key not in dst_keys:
            continue
        src_value = get_key_value(src_data, key)
        dst_value = get_key_value(dst_data, key)
        src_tags = extract_template_tags(src_value)
        src_tags.sort()
        dst_tags = extract_template_tags(dst_value)
        dst_tags.sort()
        if src_tags != dst_tags:
            missing_tags = [k for k in src_tags if k not in dst_tags]
            errors.append(f"Lang {lang}, Namespace {namespace}, Key {key}: Template tags mismatch: {', '.join(missing_tags)}")
    return errors


def main():
    errors = []
    base_dir = os.path.join(os.path.dirname(__file__), "public", "locales")
    langs = [lng for lng in os.listdir(base_dir) if lng != SRC_LNG]
    namespaces = os.listdir(os.path.join(base_dir, SRC_LNG))
    namespaces.sort()
    for lang in langs:
        for namespace in namespaces:
            errors += validate_namespace(base_dir, lang, namespace)
        lang_namespaces = os.listdir(os.path.join(base_dir, lang))
        lang_namespaces.sort()
        extra_namespaces = [ns for ns in lang_namespaces if ns not in namespaces]
        if len(extra_namespaces) > 0:
            errors.append(f"Language {lang} contains extra namespaces: {', '.join(extra_namespaces)}")
    if len(errors) > 0:
        print("Detected errors in translation files:")
        for error in errors:
            print(error)
        sys.exit(1)


if __name__ == '__main__':
    main()
