<script lang="ts">
    import loader from '@monaco-editor/loader';
    import { onDestroy, onMount } from 'svelte';
    import type * as Monaco from 'monaco-editor/esm/vs/editor/editor.api';

    let editor: Monaco.editor.IStandaloneCodeEditor;
    let monaco: typeof Monaco;
    let editorContainer: HTMLElement;

    onMount(async () => {
        // Remove the next two lines to load the monaco editor from a CDN
        // see https://www.npmjs.com/package/@monaco-editor/loader#config
        const monacoEditor = await import('monaco-editor');
        loader.config({ monaco: monacoEditor.default });

        monaco = await loader.init();

        // Your monaco instance is ready, let's display some code!
        const editor = monaco.editor.create(editorContainer);
        const model = monaco.editor.createModel(
            `package io.github.0tak2;

import java.util.List;
import java.util.ArrayList;

import com.tmax.TmaxCloud;

@Getter
public class Me extends BackendDeveloper {
    private final String nameKor = "임영택";
    private final String nameEng = "Youngtaek Lim";
    private final Contact email = EmailContact.of("0tak2.code@gmail.com");
    private final Contact github = WebContact.of("https://github.com/0tak2");
    private final Contact blog = WebContact.of("https://archiveyoung.tistory.com/");
    private Company workAt = TmaxCloud.getInstance();
    private List<Interest> interests = new ArrayList(Arrays.asList(
            new Interest("Modern Java"),
            new Interest("Distributed System"),
            new Interest("Clean Architecture")
    ));

    public Performance work(List<Object> inputs) {
        inputs.add("Responsibility");
        inputs.add("Trust");
        inputs.add("TDD");
        
        return this.doBest(inputs);
    }
}
`,
            'java'
        );
        editor.setModel(model);
    });

    onDestroy(() => {
        monaco?.editor.getModels().forEach((model) => model.dispose());
        editor?.dispose();
    });
</script>

<div>
    <div class="monaco-container" bind:this={editorContainer} />
</div>

<style>
    .monaco-container {
        width: 100%;
        height: 600px;
        border: solid 1px black;
    }
</style>